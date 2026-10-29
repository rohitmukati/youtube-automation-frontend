"use client";

import { Ban, RotateCcw, WifiOff } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { UploadSession } from "@/features/uploads/upload-manager";
import { formatBytes } from "@/lib/utils";

interface UploadProgressPanelProps {
  session: UploadSession;
  cancelling?: boolean;
  onCancel: () => void;
  onRetry: () => void;
  onDismiss: () => void;
}

/** Phase A: the browser is sending the video straight to cloud storage. */
export function UploadProgressPanel({
  session,
  cancelling = false,
  onCancel,
  onRetry,
  onDismiss,
}: UploadProgressPanelProps) {
  if (session.phase === "error") {
    return (
      <div className="flex flex-col gap-4">
        <Alert tone="danger" title="The video could not be uploaded">
          {session.error}
        </Alert>
        <div className="flex flex-wrap gap-2">
          {session.terminal ? null : (
            <Button onClick={onRetry}>
              <RotateCcw /> Try again
            </Button>
          )}
          <Button variant="outline" onClick={onDismiss}>
            {session.terminal ? "Start over" : "Dismiss"}
          </Button>
          {session.terminal ? null : (
            <Button variant="danger-outline" onClick={onCancel} loading={cancelling}>
              <Ban /> Cancel upload
            </Button>
          )}
        </div>
      </div>
    );
  }

  const finishing = session.phase === "completing" || session.phase === "done";
  const percent = finishing ? 100 : session.percent;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-foreground text-sm font-medium">
          {finishing ? "Finishing upload…" : "Uploading video to the cloud"}
        </p>
        <p className="text-muted-foreground text-sm tabular-nums">{percent}%</p>
      </div>
      <Progress value={percent} label="Video upload progress" />
      <p className="text-muted-foreground text-[13px] tabular-nums">
        {formatBytes(finishing ? session.totalBytes : session.sentBytes)} of{" "}
        {formatBytes(session.totalBytes)} · {session.fileName}
      </p>

      {session.waitingForConnection ? (
        <Alert tone="warning" title="Waiting for connection">
          <span className="inline-flex items-center gap-1.5">
            <WifiOff className="size-3.5" aria-hidden /> The upload continues by itself when you are
            back online.
          </span>
        </Alert>
      ) : (
        <p className="text-muted-foreground text-[13px]">
          Keep this tab open until the upload finishes. After that, publishing continues on our
          servers and you can close the tab.
        </p>
      )}

      {finishing ? null : (
        <div>
          <Button variant="danger-outline" size="sm" onClick={onCancel} loading={cancelling}>
            <Ban /> Cancel upload
          </Button>
        </div>
      )}
    </div>
  );
}
