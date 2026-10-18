"use client";

import Link from "next/link";
import { Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/format";
import { formatBytes } from "@/lib/utils";
import type { StorageFile } from "@/types/api";

interface FilePreviewDialogProps {
  file: StorageFile | null;
  onOpenChange: (open: boolean) => void;
}

export function FilePreviewDialog({ file, onOpenChange }: FilePreviewDialogProps) {
  const isVideo = file?.file_type === "video";

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
            isVideo ? (
              <video
                src={file.signed_url}
                controls
                preload="metadata"
                playsInline
                className="max-h-[60dvh] w-full rounded-2xl bg-black"
              />
            ) : (
              <img
                src={file.signed_url}
                alt={file.original_name}
                className="mx-auto max-h-[60dvh] rounded-2xl object-contain"
              />
            )
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
            {isVideo && file ? (
              <Button asChild size="sm">
                <Link href={`/uploads/new?file=${file.id}`}>
                  <Send /> Publish this video
                </Link>
              </Button>
            ) : null}
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
