import { FILE_TYPES, LIMITS } from "@/config/constants";
import { isVideoFileName } from "@/features/uploads/video-file";
import { formatBytes } from "@/lib/utils";

export const IMAGE_ACCEPT = [...FILE_TYPES.image.mime, ...FILE_TYPES.image.extensions].join(",");

function isImage(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    (FILE_TYPES.image.mime as readonly string[]).includes(file.type) ||
    FILE_TYPES.image.extensions.some((extension) => name.endsWith(extension))
  );
}

/** Storage holds images only (thumbnails). Videos are uploaded when publishing. */
export function validateImageFile(file: File): string | null {
  if (isVideoFileName(file.name) || file.type.startsWith("video/")) {
    return "Videos are not stored here. Choose the video on the Publish page; it uploads when you press Publish.";
  }
  if (!isImage(file)) return "Unsupported file type. Use JPG, PNG, WEBP or GIF images.";
  if (file.size === 0) return "This file is empty.";
  if (file.size > LIMITS.imageBytes) {
    return `This file is ${formatBytes(file.size)}. The limit for images is ${formatBytes(LIMITS.imageBytes)}.`;
  }
  return null;
}
