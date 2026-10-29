import type { MediaUploadInfo } from "@/types/api";

export class PartHttpError extends Error {
  readonly status: number;
  constructor(status: number) {
    super(`Part upload failed with HTTP ${status}`);
    this.name = "PartHttpError";
    this.status = status;
  }
}

export class PartNetworkError extends Error {
  constructor() {
    super("Network error while uploading a part");
    this.name = "PartNetworkError";
  }
}

export class UploadAbortedError extends Error {
  constructor() {
    super("Upload aborted");
    this.name = "UploadAbortedError";
  }
}

export interface UploadProgress {
  sentBytes: number;
  totalBytes: number;
  percent: number;
}

export interface UploadPartsOptions {
  file: File;
  info: MediaUploadInfo;
  /** Asks the server for fresh URLs. Returns null when the file is already complete. */
  refreshInfo: () => Promise<MediaUploadInfo | null>;
  onProgress: (progress: UploadProgress) => void;
  onWaiting?: (waiting: boolean) => void;
  signal: AbortSignal;
  maxAttemptsPerPart?: number;
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new UploadAbortedError());
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      reject(new UploadAbortedError());
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

function waitUntilOnline(
  signal: AbortSignal,
  onWaiting?: (waiting: boolean) => void,
): Promise<void> {
  if (signal.aborted) return Promise.reject(new UploadAbortedError());
  if (navigator.onLine) return Promise.resolve();
  onWaiting?.(true);
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      window.removeEventListener("online", onOnline);
      signal.removeEventListener("abort", onAbort);
      onWaiting?.(false);
    };
    const onOnline = () => {
      cleanup();
      resolve();
    };
    const onAbort = () => {
      cleanup();
      reject(new UploadAbortedError());
    };
    window.addEventListener("online", onOnline);
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

/**
 * Sends one part straight to cloud storage. Deliberately NOT using the app's axios client:
 * the presigned URL carries its own signature and must not get an Authorization header,
 * cookies or custom headers.
 */
function putBlob(
  url: string,
  blob: Blob,
  onBytes: (loaded: number) => void,
  signal: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new UploadAbortedError());
      return;
    }
    const xhr = new XMLHttpRequest();
    const onAbort = () => {
      xhr.abort();
      reject(new UploadAbortedError());
    };
    const finish = () => signal.removeEventListener("abort", onAbort);
    xhr.open("PUT", url);
    xhr.timeout = 10 * 60 * 1000;
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onBytes(event.loaded);
    };
    xhr.onload = () => {
      finish();
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new PartHttpError(xhr.status));
    };
    xhr.onerror = () => {
      finish();
      reject(new PartNetworkError());
    };
    xhr.ontimeout = () => {
      finish();
      reject(new PartNetworkError());
    };
    signal.addEventListener("abort", onAbort, { once: true });
    xhr.send(blob);
  });
}

export async function uploadParts(options: UploadPartsOptions): Promise<void> {
  const { file, info, signal } = options;
  const maxAttempts = options.maxAttemptsPerPart ?? 5;
  const total = info.size_bytes;
  const partSize = info.part_size_bytes;

  const urls = new Map<number, string>();
  const sizes = new Map<number, number>();
  const remember = (parts: MediaUploadInfo["parts"]) => {
    for (const part of parts) {
      urls.set(part.part_number, part.url);
      sizes.set(part.part_number, part.size_bytes);
    }
  };
  remember(info.parts);

  // The server gives the size of every part to send. Parts that are already stored use the
  // regular layout: every part is `part_size_bytes`, the last one is shorter.
  const sizeOf = (n: number): number =>
    sizes.get(n) ?? (n < info.total_parts ? partSize : total - partSize * (info.total_parts - 1));

  const done = new Map<number, number>(info.uploaded_part_numbers.map((n) => [n, sizeOf(n)]));
  const inflight = new Map<number, number>();
  const queue = info.parts.map((part) => part.part_number);
  let finishedElsewhere = false;

  const emit = () => {
    let sent = 0;
    done.forEach((value) => {
      sent += value;
    });
    inflight.forEach((value) => {
      sent += value;
    });
    sent = Math.min(sent, total);
    options.onProgress({
      sentBytes: sent,
      totalBytes: total,
      percent: total > 0 ? Math.floor((sent / total) * 100) : 0,
    });
  };
  emit();

  const refreshUrls = async () => {
    const fresh = await options.refreshInfo();
    if (fresh === null) {
      finishedElsewhere = true;
      return;
    }
    remember(fresh.parts);
  };

  const uploadOne = async (n: number): Promise<void> => {
    const start = (n - 1) * partSize;
    const blob = file.slice(start, start + sizeOf(n));
    for (let attempt = 1; ; attempt += 1) {
      await waitUntilOnline(signal, options.onWaiting);
      try {
        const url = urls.get(n);
        if (!url) throw new PartHttpError(403);
        await putBlob(
          url,
          blob,
          (loaded) => {
            inflight.set(n, loaded);
            emit();
          },
          signal,
        );
        inflight.delete(n);
        done.set(n, sizeOf(n));
        emit();
        return;
      } catch (error) {
        inflight.delete(n);
        emit();
        if (signal.aborted || error instanceof UploadAbortedError) throw new UploadAbortedError();
        if (attempt >= maxAttempts) throw error;
        if (error instanceof PartHttpError && error.status === 403) {
          await refreshUrls();
          if (finishedElsewhere) return;
        } else if (
          error instanceof PartHttpError &&
          error.status >= 400 &&
          error.status < 500 &&
          error.status !== 408 &&
          error.status !== 429
        ) {
          throw error;
        }
        await sleep(Math.min(1000 * 2 ** (attempt - 1), 15_000) + Math.random() * 500, signal);
      }
    }
  };

  let fatal: unknown = null;
  const worker = async () => {
    while (queue.length > 0 && fatal === null && !finishedElsewhere) {
      const n = queue.shift();
      if (n === undefined) return;
      try {
        await uploadOne(n);
      } catch (error) {
        fatal = error;
        return;
      }
    }
  };
  const count = Math.max(1, Math.min(info.max_parallel_parts, queue.length));
  await Promise.all(Array.from({ length: count }, () => worker()));
  if (fatal !== null) throw fatal;
}
