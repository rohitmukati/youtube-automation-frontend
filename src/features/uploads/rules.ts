import { FINAL_JOB_STATUSES } from "@/config/constants";
import type { UploadJobSummary } from "@/types/api";

type JobLike = Pick<
  UploadJobSummary,
  "status" | "failed_count" | "active_count" | "media_status" | "media_expires_at"
>;

/** A job is finished when its status is final and no channel is still active. */
export function isJobFinished(job: Pick<UploadJobSummary, "status" | "active_count">): boolean {
  return (FINAL_JOB_STATUSES as readonly string[]).includes(job.status) && job.active_count === 0;
}

/** True while the video file is still stored on the server (so channels can be retried). */
export function isMediaAvailable(job: JobLike, now: number = Date.now()): boolean {
  return (
    job.media_status === "ready" &&
    job.media_expires_at !== null &&
    Date.parse(job.media_expires_at) > now
  );
}

export function canRetry(job: JobLike, now: number = Date.now()): boolean {
  return job.failed_count > 0 && job.active_count === 0 && isMediaAvailable(job, now);
}

export function canCancel(job: Pick<UploadJobSummary, "active_count">): boolean {
  return job.active_count > 0;
}

/** The browser upload was interrupted and the user has to select the same file again. */
export function needsFileToResume(job: Pick<UploadJobSummary, "status" | "media_status">): boolean {
  return job.status === "uploading_media" && job.media_status === "uploading";
}

/** Some channels failed, and the video is no longer stored, so a retry is impossible. */
export function fileRemovedForRetry(job: JobLike, now: number = Date.now()): boolean {
  return job.failed_count > 0 && !isMediaAvailable(job, now);
}

export function hoursLeft(job: JobLike, now: number = Date.now()): number | null {
  if (job.media_status !== "ready" || job.media_expires_at === null) return null;
  return Math.max(0, (Date.parse(job.media_expires_at) - now) / 3_600_000);
}

export function describeHoursLeft(hours: number): string {
  if (hours < 1) return "less than an hour";
  const rounded = Math.round(hours);
  return rounded === 1 ? "1 hour" : `${rounded} hours`;
}

export function fileMatchesJob(
  file: File,
  job: Pick<UploadJobSummary, "source_file_name" | "source_size_bytes">,
): boolean {
  return file.name === job.source_file_name && file.size === job.source_size_bytes;
}
