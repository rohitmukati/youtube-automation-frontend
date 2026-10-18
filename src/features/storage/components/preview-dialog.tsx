"use client";

import Link from "next/link";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { isVideoFile } from "@/features/storage/components/file-card";
import { formatBytes } from "@/lib/utils";
import type { StorageFile } from "@/types/api";

interface PreviewDialogProps {
  file: StorageFile | null;
  onOpenChange: (open: boolean) => void;
}

export function PreviewDialog({ file, onOpenChange }: PreviewDialogProps) {
  return (
    <Dialog open={Boolean(file)} onOpenChange={onOpenChange}>
      <DialogContent size="xl">
        {file ? (
          <>
            <DialogHeader
              title={file.original_name}
              description={`${formatBytes(file.size_bytes)} · ${file.content_type}`}
            />
            <div className="scrollbar-thin overflow-y-auto px-6 py-5">
              {file.signed_url ? (
                isVideoFile(file) ? (
                  <video
                    src={file.signed_url}
                    controls
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
                <p className="bg-muted text-muted-foreground rounded-2xl px-4 py-10 text-center text-sm">
                  A preview is not available for this file.
                </p>
              )}
              {file.tags.length > 0 ? (
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {file.tags.map((tag) => (
                    <li key={tag} className="bg-muted text-body rounded-full px-2.5 py-1 text-xs">
                      {tag}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            {isVideoFile(file) ? (
              <div className="flex justify-end px-6 pb-6">
                <Button asChild>
                  <Link href={`/uploads/new?file=${file.id}`}>
                    <Send /> Publish to channels
                  </Link>
                </Button>
              </div>
            ) : null}
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
