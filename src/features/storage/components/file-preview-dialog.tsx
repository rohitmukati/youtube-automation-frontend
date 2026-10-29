"use client";

import { Badge } from "@/components/ui/badge";
import { Dialog, DialogBody, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/format";
import { formatBytes } from "@/lib/utils";
import type { StorageFile } from "@/types/api";

interface FilePreviewDialogProps {
  file: StorageFile | null;
  onOpenChange: (open: boolean) => void;
}

export function FilePreviewDialog({ file, onOpenChange }: FilePreviewDialogProps) {
  return (
    <Dialog open={Boolean(file)} onOpenChange={onOpenChange}>
      <DialogContent size="xl">
        <DialogHeader
          title={file?.original_name ?? "Preview"}
          description={
            file
              ? `${formatBytes(file.size_bytes)} · Added ${formatDateTime(file.created_at)}`
              : undefined
          }
        />
        <DialogBody className="flex flex-col gap-4">
          {file?.signed_url ? (
            <img
              src={file.signed_url}
              alt={file.original_name}
              className="mx-auto max-h-[60dvh] rounded-2xl object-contain"
            />
          ) : (
            <p className="bg-muted text-muted-foreground rounded-2xl px-5 py-10 text-center text-sm">
              A preview link is not available. Reload the page to get a fresh one.
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {file?.tags.length ? (
                file.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)
              ) : (
                <span className="text-muted-foreground text-sm">No tags</span>
              )}
            </div>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
