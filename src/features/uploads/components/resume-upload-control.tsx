"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FileUp } from "lucide-react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import { fileMatchesJob } from "@/features/uploads/rules";
import { uploadManager } from "@/features/uploads/upload-manager";
import type { ResumableJob } from "@/features/uploads/upload-flow";
import { VIDEO_ACCEPT } from "@/features/uploads/video-file";

interface ResumeUploadControlProps {
  job: ResumableJob;
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
  label?: string;
}

/**
 * A browser cannot reopen a file after a refresh, so to continue an interrupted upload the user
 * selects the same file again. Only the parts that are missing are sent.
 */
export function ResumeUploadControl({
  job,
  size = "sm",
  variant = "outline",
  label = "Finish upload",
}: ResumeUploadControlProps) {
  const queryClient = useQueryClient();
  const inputRef = React.useRef<HTMLInputElement>(null);

  function onPick(file: File | undefined) {
    if (!file) return;
    if (!fileMatchesJob(file, job)) {
      toast.error(`This is not the same file. Select ${job.source_file_name} to continue.`);
      return;
    }
    uploadManager.resume(job, file, queryClient);
  }

  return (
    <>
      <Button variant={variant} size={size} onClick={() => inputRef.current?.click()}>
        <FileUp /> {label}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={VIDEO_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          onPick(file);
        }}
      />
    </>
  );
}
