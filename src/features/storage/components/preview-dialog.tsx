"use client";

import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
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
                <img
                  src={file.signed_url}
                  alt={file.original_name}
                  className="mx-auto max-h-[60dvh] rounded-2xl object-contain"
                />
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
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
