"use client";

import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ResumeUploadControl } from "@/features/uploads/components/resume-upload-control";
import { useUploads } from "@/features/uploads/hooks";
import { needsFileToResume } from "@/features/uploads/rules";
import { useUploadSessions } from "@/features/uploads/upload-manager";

const PARAMS = { status: "uploading_media", limit: 5, offset: 0 } as const;

/**
 * Lists uploads whose browser upload was interrupted (refresh, closed tab, lost connection).
 * The user selects the same file again and only the missing parts are sent.
 */
export function UnfinishedUploadsBanner({ excludeJobId }: { excludeJobId?: string | null }) {
  const { data } = useUploads(PARAMS);
  const sessions = useUploadSessions();

  const jobs = (data?.jobs ?? []).filter(
    (job) => job.id !== excludeJobId && job.status === "uploading_media" && needsFileToResume(job),
  );
  if (jobs.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {jobs.map((job) => {
        const session = sessions[job.id];
        const sending =
          session && (session.phase === "uploading" || session.phase === "completing");
        return (
          <Alert
            key={job.id}
            tone="info"
            title={sending ? `Uploading ${job.source_file_name}…` : "You have an unfinished upload"}
            action={
              sending ? (
                <Button asChild size="sm" variant="outline">
                  <Link href={`/uploads/${job.id}`}>View</Link>
                </Button>
              ) : (
                <ResumeUploadControl job={job} />
              )
            }
          >
            {sending
              ? `${session.percent}% sent. Keep this tab open until it finishes.`
              : `${job.source_file_name} was not fully uploaded. Select the same file to continue where it stopped.`}
          </Alert>
        );
      })}
    </div>
  );
}
