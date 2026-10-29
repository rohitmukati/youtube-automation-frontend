import { uploadsApi } from "@/features/uploads/api";
import { fileMatchesJob } from "@/features/uploads/rules";
import { uploadParts, type UploadProgress } from "@/features/uploads/upload-parts";
import { ApiError } from "@/lib/api/errors";
import type { MediaUploadInfo, UploadJobDetail, UploadJobSummary } from "@/types/api";

export interface FlowCallbacks {
  onProgress: (progress: UploadProgress) => void;
  onWaiting?: (waiting: boolean) => void;
  /** Called when the browser starts the final `complete` call. */
  onCompleting?: () => void;
}

export type ResumableJob = Pick<UploadJobSummary, "id" | "source_file_name" | "source_size_bytes">;

const MAX_COMPLETE_ROUNDS = 4;

/**
 * Sends every missing part straight to storage, then calls `complete`.
 * If the server says parts are missing (`upload_incomplete`), it asks for fresh URLs and tries again.
 */
export async function sendFileAndComplete(
  jobId: string,
  file: File,
  initial: MediaUploadInfo | null,
  signal: AbortSignal,
  callbacks: FlowCallbacks,
): Promise<UploadJobDetail> {
  let info = initial;
  for (let round = 1; round <= MAX_COMPLETE_ROUNDS; round += 1) {
    if (info !== null && info.parts.length > 0) {
      await uploadParts({
        file,
        info,
        signal,
        onProgress: callbacks.onProgress,
        onWaiting: callbacks.onWaiting,
        refreshInfo: async () => (await uploadsApi.mediaState(jobId, signal)).upload,
      });
    }
    callbacks.onCompleting?.();
    try {
      return await uploadsApi.completeMedia(jobId, signal);
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.code === "upload_incomplete" &&
        round < MAX_COMPLETE_ROUNDS
      ) {
        info = (await uploadsApi.mediaState(jobId, signal)).upload;
        continue;
      }
      throw error;
    }
  }
  throw new Error("The upload could not be completed. Please try again.");
}

/** Resume an interrupted browser upload: ask which parts are stored and send only the rest. */
export async function resumeUpload(
  job: ResumableJob,
  file: File,
  signal: AbortSignal,
  callbacks: FlowCallbacks,
): Promise<UploadJobDetail> {
  if (!fileMatchesJob(file, job)) {
    throw new Error(`Please select the same file again: ${job.source_file_name}`);
  }
  const state = await uploadsApi.mediaState(job.id, signal);
  return sendFileAndComplete(job.id, file, state.upload, signal, callbacks);
}
