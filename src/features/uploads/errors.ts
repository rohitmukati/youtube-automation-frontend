import { ApiError } from "@/lib/api/errors";
import { PartHttpError, PartNetworkError } from "@/features/uploads/upload-parts";

const TERMINAL_CODES = ["upload_session_gone", "media_expired", "invalid_video_file"];

/** Errors where trying again with the same upload cannot help: the user has to publish again. */
export function isTerminalUploadError(error: unknown): boolean {
  return error instanceof ApiError && TERMINAL_CODES.includes(error.code);
}

export function messageForUploadError(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case "media_expired":
        return "The video file is no longer stored. Please publish it again.";
      case "upload_session_gone":
        return "This upload expired. Please start it again.";
      case "staging_busy":
        return "Uploads are very busy. Try again in a few minutes.";
      default:
        return error.message;
    }
  }
  if (error instanceof PartNetworkError) {
    return "The connection was interrupted while sending the video. Check your internet and try again.";
  }
  if (error instanceof PartHttpError) {
    return `Cloud storage refused part of the upload (HTTP ${error.status}). Try again, and contact support if it keeps happening.`;
  }
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong. Please try again.";
}
