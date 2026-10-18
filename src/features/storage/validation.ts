import { FILE_TYPES, LIMITS } from "@/config/constants";
import { formatBytes } from "@/lib/utils";
import type { StorageFileType } from "@/types/api";

export function detectFileKind(file: File): StorageFileType | null {
  const name = file.name.toLowerCase();
  const matches = (kind: StorageFileType) =>
    (FILE_TYPES[kind].mime as readonly string[]).includes(file.type) ||
    FILE_TYPES[kind].extensions.some((extension) => name.endsWith(extension));
  if (matches("video")) return "video";
  if (matches("image")) return "image";
  return null;
}

export function validateMediaFile(
  file: File,
  allowed: StorageFileType[] = ["video", "image"],
): string | null {
  const kind = detectFileKind(file);
  if (!kind || !allowed.includes(kind)) {
    const labels = allowed.map((item) =>
      item === "video" ? "MP4, MOV, AVI, MKV, WEBM or MPEG videos" : "JPG, PNG, WEBP or GIF images",
    );
    return `Unsupported file type. Use ${labels.join(" or ")}.`;
  }
  const limit = kind === "video" ? LIMITS.videoBytes : LIMITS.imageBytes;
  if (file.size > limit)
    return `This file is ${formatBytes(file.size)}. The limit for ${kind}s is ${formatBytes(limit)}.`;
  if (file.size === 0) return "This file is empty.";
  return null;
}

export const VIDEO_ACCEPT = [...FILE_TYPES.video.mime, ...FILE_TYPES.video.extensions].join(",");
export const MEDIA_ACCEPT = [
  ...FILE_TYPES.video.mime,
  ...FILE_TYPES.video.extensions,
  ...FILE_TYPES.image.mime,
  ...FILE_TYPES.image.extensions,
].join(",");
