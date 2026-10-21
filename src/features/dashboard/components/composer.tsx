"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowUp, Plus } from "lucide-react";
import { toast } from "sonner";
import { Orb } from "@/components/ui/orb";
import { Progress } from "@/components/ui/progress";
import { storageApi } from "@/features/storage/api";
import { validateMediaFile, VIDEO_ACCEPT } from "@/features/storage/validation";
import { getErrorMessage } from "@/lib/api/errors";
import { queryKeys } from "@/lib/query-keys";

export function Composer() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [progress, setProgress] = React.useState<number | null>(null);
  const uploading = progress !== null;

  async function handleFile(file: File) {
    const problem = validateMediaFile(file, ["video"]);
    if (problem) {
      toast.error(problem);
      return;
    }
    setProgress(0);
    try {
      const stored = await storageApi.upload(file, [], setProgress);
      await queryClient.invalidateQueries({ queryKey: queryKeys.storage.all });
      toast.success("Video added to Storage.");
      router.push(`/uploads/new?file=${stored.id}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setProgress(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="border-border bg-card shadow-soft flex h-16 items-center gap-2 rounded-full border px-3">
        <Orb size={38} />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          aria-label="Upload a video from your computer"
          className="text-foreground hover:bg-muted grid size-9 shrink-0 place-items-center rounded-full transition-colors disabled:opacity-50"
        >
          <Plus className="size-5" />
        </button>
        {uploading ? (
          <p className="text-body flex-1 truncate text-[15px]" role="status">
            {(progress ?? 0) >= 100
              ? "Processing on server…"
              : `Uploading to Storage… ${progress}%`}
          </p>
        ) : (
          <Link
            href="/uploads/new"
            className="text-muted-foreground flex h-full flex-1 items-center truncate text-[15px]"
          >
            Publish a video to your channels...
          </Link>
        )}
        <Link
          href="/uploads/new"
          aria-label="Start publishing"
          className="bg-primary text-primary-foreground hover:bg-primary/85 grid size-10 shrink-0 place-items-center rounded-full transition-colors"
        >
          <ArrowUp className="size-[18px]" />
        </Link>
        <input
          ref={inputRef}
          type="file"
          accept={VIDEO_ACCEPT}
          className="sr-only"
          tabIndex={-1}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void handleFile(file);
          }}
        />
      </div>
      {uploading ? (
        <Progress value={progress ?? 0} className="mx-6 mt-3 w-auto" label="Upload progress" />
      ) : null}
    </div>
  );
}