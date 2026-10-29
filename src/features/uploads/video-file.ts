import { FILE_TYPES, LIMITS } from "@/config/constants";
import { formatBytes } from "@/lib/utils";

/** Value for the `accept` attribute of the video file input. */
export const VIDEO_ACCEPT = [...FILE_TYPES.video.extensions, "video/*"].join(",");

export function isVideoFileName(name: string): boolean {
  const lower = name.toLowerCase();
  return FILE_TYPES.video.extensions.some((extension) => lower.endsWith(extension));
}

/**
 * Instant client side check for a picked video. The server validates everything again,
 * so this only exists to give the user quick feedback.
 */
export function validateVideoFile(file: File): string | null {
  if (!isVideoFileName(file.name)) {
    return "Unsupported file type. Use an MP4, M4V, MOV, AVI, MKV, WEBM or MPEG video.";
  }
  if (file.size === 0) return "This file is empty.";
  if (file.size > LIMITS.videoBytes) {
    return `This video is ${formatBytes(file.size)}. The limit is ${formatBytes(LIMITS.videoBytes)}.`;
  }
  return null;
}
