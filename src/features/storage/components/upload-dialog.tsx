"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CircleAlert, CircleCheck, FileUp, ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { TagInput } from "@/components/ui/tag-input";
import { LIMITS } from "@/config/constants";
import { storageApi } from "@/features/storage/api";
import { IMAGE_ACCEPT, validateImageFile } from "@/features/storage/validation";
import { getErrorMessage } from "@/lib/api/errors";
import { queryKeys } from "@/lib/query-keys";
import { cn, formatBytes } from "@/lib/utils";

type ItemStatus = "queued" | "uploading" | "done" | "error";

interface QueueItem {
  id: string;
  file: File;
  status: ItemStatus;
  progress: number;
  error?: string;
}

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UploadBodyProps {
  onClose: () => void;
  onRunningChange: (running: boolean) => void;
}

function UploadBody({ onClose, onRunningChange }: UploadBodyProps) {
  const queryClient = useQueryClient();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const abortRef = React.useRef<AbortController | null>(null);
  const [items, setItems] = React.useState<QueueItem[]>([]);
  const [tags, setTags] = React.useState<string[]>([]);
  const [dragging, setDragging] = React.useState(false);
  const [running, setRunning] = React.useState(false);
  const [rejections, setRejections] = React.useState<string[]>([]);

  const addFiles = React.useCallback((files: File[]) => {
    const accepted: QueueItem[] = [];
    const rejected: string[] = [];
    for (const file of files) {
      const problem = validateImageFile(file);
      if (problem) rejected.push(`${file.name}: ${problem}`);
      else accepted.push({ id: crypto.randomUUID(), file, status: "queued", progress: 0 });
    }
    setRejections(rejected);
    setItems((current) => [...current, ...accepted]);
  }, []);

  React.useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const setRunningState = (value: boolean) => {
    setRunning(value);
    onRunningChange(value);
  };

  const patch = (id: string, changes: Partial<QueueItem>) =>
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...changes } : item)));

  async function startUpload() {
    const controller = new AbortController();
    abortRef.current = controller;
    setRunningState(true);
    const pending = items.filter((item) => item.status === "queued" || item.status === "error");
    for (const item of pending) {
      if (controller.signal.aborted) break;
      patch(item.id, { status: "uploading", progress: 0, error: undefined });
      try {
        await storageApi.upload(
          item.file,
          tags,
          (progress) => patch(item.id, { progress }),
          controller.signal,
        );
        patch(item.id, { status: "done", progress: 100 });
      } catch (error) {
        if (controller.signal.aborted) break;
        patch(item.id, { status: "error", error: getErrorMessage(error) });
      }
    }
    setRunningState(false);
    await queryClient.invalidateQueries({ queryKey: queryKeys.storage.all });
  }

  const remaining = items.filter(
    (item) => item.status === "queued" || item.status === "error",
  ).length;
  const allDone = items.length > 0 && items.every((item) => item.status === "done");

  return (
    <>
      <DialogHeader
        title="Upload images"
        description="Images are kept privately in your library so you can use them as video thumbnails."
      />
      <DialogBody className="flex flex-col gap-5">
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            addFiles(Array.from(event.dataTransfer.files));
          }}
          className={cn(
            "flex flex-col items-center gap-3 rounded-3xl border border-dashed px-6 py-10 text-center transition-colors",
            dragging ? "border-foreground bg-muted" : "border-border-strong",
          )}
        >
          <span className="bg-muted text-foreground grid size-12 place-items-center rounded-2xl">
            <FileUp className="size-5" />
          </span>
          <div>
            <p className="text-foreground text-sm font-medium">Drag images here, or</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => inputRef.current?.click()}
              disabled={running}
            >
              Choose images
            </Button>
          </div>
          <p className="text-muted-foreground text-[13px]">
            JPG, PNG, WEBP or GIF · up to {formatBytes(LIMITS.imageBytes)} · YouTube thumbnails must be
            JPG or PNG
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={IMAGE_ACCEPT}
            className="sr-only"
            tabIndex={-1}
            onChange={(event) => {
              addFiles(Array.from(event.target.files ?? []));
              event.target.value = "";
            }}
          />
        </div>

        {rejections.length > 0 ? (
          <ul
            className="bg-danger-soft text-danger flex flex-col gap-1 rounded-2xl px-4 py-3 text-[13px]"
            role="alert"
          >
            {rejections.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        ) : null}

        {items.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {items.map((item) => {
              return (
                <li key={item.id} className="border-border rounded-2xl border p-3.5">
                  <div className="flex items-center gap-3">
                    <ImageIcon className="text-muted-foreground size-4 shrink-0" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground truncate text-sm">{item.file.name}</p>
                      <p className="text-muted-foreground text-[13px]">
                        {formatBytes(item.file.size)}
                        {item.status === "uploading"
                          ? item.progress < 100
                            ? ` · ${item.progress}%`
                            : " · Processing on server…"
                          : null}
                      </p>
                    </div>
                    {item.status === "uploading" ? (
                      <Spinner className="size-4" label="Uploading" />
                    ) : null}
                    {item.status === "done" ? (
                      <CircleCheck className="text-success size-4" aria-label="Uploaded" />
                    ) : null}
                    {item.status === "error" ? (
                      <CircleAlert className="text-danger size-4" aria-label="Failed" />
                    ) : null}
                    {item.status === "queued" && !running ? (
                      <button
                        type="button"
                        onClick={() =>
                          setItems((current) => current.filter((entry) => entry.id !== item.id))
                        }
                        className="text-muted-foreground hover:bg-muted hover:text-foreground grid size-7 place-items-center rounded-full"
                        aria-label={`Remove ${item.file.name}`}
                      >
                        <X className="size-4" />
                      </button>
                    ) : null}
                  </div>
                  {item.status === "uploading" || item.status === "done" ? (
                    <Progress
                      value={item.progress}
                      tone={item.status === "done" ? "success" : "default"}
                      className="mt-3"
                      label={`Upload progress for ${item.file.name}`}
                    />
                  ) : null}
                  {item.error ? <p className="text-danger mt-2 text-[13px]">{item.error}</p> : null}
                </li>
              );
            })}
          </ul>
        ) : null}

        <Field label="Tags" optional hint="Applied to every image in this batch.">
          <TagInput value={tags} onChange={setTags} maxTagLength={LIMITS.tagMax} />
        </Field>
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={running}>
          {allDone ? "Close" : "Cancel"}
        </Button>
        {allDone ? null : (
          <Button onClick={startUpload} loading={running} disabled={remaining === 0}>
            {remaining > 0 ? `Upload ${remaining} ${remaining === 1 ? "image" : "images"}` : "Upload"}
          </Button>
        )}
      </DialogFooter>
    </>
  );
}

export function UploadDialog({ open, onOpenChange }: UploadDialogProps) {
  const [running, setRunning] = React.useState(false);
  return (
    <Dialog open={open} onOpenChange={(next) => (running ? undefined : onOpenChange(next))}>
      <DialogContent size="lg">
        <UploadBody onClose={() => onOpenChange(false)} onRunningChange={setRunning} />
      </DialogContent>
    </Dialog>
  );
}