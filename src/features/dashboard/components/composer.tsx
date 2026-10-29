"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUp, Plus } from "lucide-react";
import { toast } from "sonner";
import { Orb } from "@/components/ui/orb";
import { setPendingVideo } from "@/features/uploads/file-handoff";
import { validateVideoFile, VIDEO_ACCEPT } from "@/features/uploads/video-file";

export function Composer() {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);

  // The video is not uploaded here any more. It is handed to the Publish page and only
  // uploaded when the user presses Publish there.
  function handleFile(file: File) {
    const problem = validateVideoFile(file);
    if (problem) {
      toast.error(problem);
      return;
    }
    setPendingVideo(file);
    router.push("/uploads/new");
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="border-border bg-card shadow-soft flex h-16 items-center gap-2 rounded-full border px-3">
        <Orb size={38} />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-label="Choose a video from your computer"
          className="text-foreground hover:bg-muted grid size-9 shrink-0 place-items-center rounded-full transition-colors"
        >
          <Plus className="size-5" />
        </button>
        <Link
          href="/uploads/new"
          className="text-muted-foreground flex h-full flex-1 items-center truncate text-[15px]"
        >
          Publish a video to your channels...
        </Link>
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
            if (file) handleFile(file);
          }}
        />
      </div>
    </div>
  );
}
