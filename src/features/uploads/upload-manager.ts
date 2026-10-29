"use client";

import * as React from "react";
import type { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { uploadsApi } from "@/features/uploads/api";
import { messageForUploadError, isTerminalUploadError } from "@/features/uploads/errors";
import {
  resumeUpload,
  sendFileAndComplete,
  type ResumableJob,
} from "@/features/uploads/upload-flow";
import { UploadAbortedError, type UploadProgress } from "@/features/uploads/upload-parts";
import { queryKeys } from "@/lib/query-keys";
import { pluralize } from "@/lib/utils";
import type { MediaUploadInfo } from "@/types/api";

export type SessionPhase = "uploading" | "completing" | "done" | "error";

export interface UploadSession {
  jobId: string;
  fileName: string;
  totalBytes: number;
  sentBytes: number;
  percent: number;
  phase: SessionPhase;
  waitingForConnection: boolean;
  error: string | null;
  /** True when retrying cannot help and the user has to publish again. */
  terminal: boolean;
}

interface Runtime {
  controller: AbortController;
  file: File;
  queryClient: QueryClient;
}

/**
 * Lives outside React so a browser upload keeps running while the user moves between pages of
 * the app. It does not survive a refresh: the user then selects the same file again (resume).
 */
let snapshot: Readonly<Record<string, UploadSession>> = {};
const runtimes = new Map<string, Runtime>();
const listeners = new Set<() => void>();
const EMPTY: Readonly<Record<string, UploadSession>> = {};

function emit() {
  listeners.forEach((listener) => listener());
}

function setSession(jobId: string, next: UploadSession | null) {
  const copy = { ...snapshot };
  if (next) copy[jobId] = next;
  else delete copy[jobId];
  snapshot = copy;
  emit();
  syncGuards();
}

function patchSession(jobId: string, changes: Partial<UploadSession>) {
  const current = snapshot[jobId];
  if (!current) return;
  setSession(jobId, { ...current, ...changes });
}

function isRunning(session: UploadSession): boolean {
  return session.phase === "uploading" || session.phase === "completing";
}

// --- Leave warning and screen wake lock while at least one upload is running ---------------

let guardsOn = false;
let wakeLock: WakeLockSentinel | null = null;

function warnBeforeLeaving(event: BeforeUnloadEvent) {
  event.preventDefault();
  event.returnValue = "";
}

async function requestWakeLock() {
  try {
    if (typeof navigator === "undefined" || !("wakeLock" in navigator)) return;
    if (wakeLock && !wakeLock.released) return;
    wakeLock = await navigator.wakeLock.request("screen");
  } catch {
    // Not supported or refused (low battery, background tab). Uploading still works.
  }
}

function onVisibilityChange() {
  if (document.visibilityState === "visible" && guardsOn) void requestWakeLock();
}

function syncGuards() {
  if (typeof window === "undefined") return;
  const running = Object.values(snapshot).some(isRunning);
  if (running && !guardsOn) {
    guardsOn = true;
    window.addEventListener("beforeunload", warnBeforeLeaving);
    document.addEventListener("visibilitychange", onVisibilityChange);
    void requestWakeLock();
  } else if (!running && guardsOn) {
    guardsOn = false;
    window.removeEventListener("beforeunload", warnBeforeLeaving);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    void wakeLock?.release().catch(() => undefined);
    wakeLock = null;
  }
}

// --- Running an upload ----------------------------------------------------------------------

async function run(
  jobId: string,
  file: File,
  queryClient: QueryClient,
  source:
    | { kind: "info"; info: MediaUploadInfo | null }
    | { kind: "resume"; job: ResumableJob }
    | { kind: "fetch" },
) {
  runtimes.get(jobId)?.controller.abort();
  const controller = new AbortController();
  runtimes.set(jobId, { controller, file, queryClient });

  setSession(jobId, {
    jobId,
    fileName: file.name,
    totalBytes: file.size,
    sentBytes: 0,
    percent: 0,
    phase: "uploading",
    waitingForConnection: false,
    error: null,
    terminal: false,
  });

  const callbacks = {
    onProgress: (progress: UploadProgress) => {
      const current = snapshot[jobId];
      if (!current || runtimes.get(jobId)?.controller !== controller) return;
      // Only publish a new snapshot when the visible percentage moves.
      if (current.percent === progress.percent && current.totalBytes === progress.totalBytes)
        return;
      patchSession(jobId, {
        sentBytes: progress.sentBytes,
        totalBytes: progress.totalBytes,
        percent: progress.percent,
      });
    },
    onWaiting: (waiting: boolean) => patchSession(jobId, { waitingForConnection: waiting }),
    onCompleting: () => patchSession(jobId, { phase: "completing", waitingForConnection: false }),
  };

  try {
    let job;
    if (source.kind === "info") {
      job = await sendFileAndComplete(jobId, file, source.info, controller.signal, callbacks);
    } else if (source.kind === "resume") {
      job = await resumeUpload(source.job, file, controller.signal, callbacks);
    } else {
      // Ask the server which parts are stored; it also hands out fresh URLs.
      const state = await uploadsApi.mediaState(jobId, controller.signal);
      job = await sendFileAndComplete(jobId, file, state.upload, controller.signal, callbacks);
    }

    patchSession(jobId, { phase: "done", percent: 100, sentBytes: file.size });
    toast.success(`Upload finished. Publishing to ${pluralize(job.total_channels, "channel")}.`);
    await queryClient.invalidateQueries({ queryKey: queryKeys.uploads.all });
    window.setTimeout(() => {
      if (snapshot[jobId]?.phase === "done") setSession(jobId, null);
    }, 15_000);
  } catch (error) {
    if (controller.signal.aborted || error instanceof UploadAbortedError) {
      // Cancelled by the user: the session is removed by `abort`.
      return;
    }
    if (process.env.NODE_ENV !== "production") console.warn("Browser upload failed", error);
    patchSession(jobId, {
      phase: "error",
      waitingForConnection: false,
      error: messageForUploadError(error),
      terminal: isTerminalUploadError(error),
    });
    await queryClient.invalidateQueries({ queryKey: queryKeys.uploads.all });
  } finally {
    if (runtimes.get(jobId)?.controller === controller && snapshot[jobId]?.phase !== "error") {
      runtimes.delete(jobId);
    }
  }
}

export const uploadManager = {
  /** Begin sending a freshly created upload (response of `POST /yt-channels/uploads`). */
  start(jobId: string, file: File, info: MediaUploadInfo | null, queryClient: QueryClient) {
    void run(jobId, file, queryClient, { kind: "info", info });
  },

  /** Continue an interrupted upload after the user selected the same file again. */
  resume(job: ResumableJob, file: File, queryClient: QueryClient) {
    void run(job.id, file, queryClient, { kind: "resume", job });
  },

  /** Try again after a temporary error, using the file that is already in memory. */
  retry(jobId: string, queryClient: QueryClient) {
    const runtime = runtimes.get(jobId);
    if (!runtime || !snapshot[jobId]) return;
    void run(jobId, runtime.file, queryClient, { kind: "fetch" });
  },

  /** Stop sending and forget the session. The caller is responsible for `POST .../cancel`. */
  abort(jobId: string) {
    runtimes.get(jobId)?.controller.abort();
    runtimes.delete(jobId);
    setSession(jobId, null);
  },

  /** Hide a finished or failed session. */
  dismiss(jobId: string) {
    runtimes.delete(jobId);
    setSession(jobId, null);
  },

  async cancelOnServer(jobId: string) {
    uploadManager.abort(jobId);
    return uploadsApi.cancel(jobId);
  },
};

// --- React bindings -------------------------------------------------------------------------

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useUploadSessions(): Readonly<Record<string, UploadSession>> {
  return React.useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => EMPTY,
  );
}

export function useUploadSession(jobId: string | null | undefined): UploadSession | null {
  const sessions = useUploadSessions();
  return jobId ? (sessions[jobId] ?? null) : null;
}
