import type { ThumbnailStatus, UploadJobStatus, UploadTargetStatus } from "@/types/api";

type Tone = "neutral" | "success" | "warning" | "danger" | "info";

interface StatusMeta {
  label: string;
  tone: Tone;
  pulse?: boolean;
}

export const jobStatusMeta: Record<UploadJobStatus, StatusMeta> = {
  uploading_media: { label: "Uploading video", tone: "info", pulse: true },
  queued: { label: "Queued", tone: "neutral", pulse: true },
  running: { label: "Publishing", tone: "info", pulse: true },
  completed: { label: "Completed", tone: "success" },
  partially_completed: { label: "Partly completed", tone: "warning" },
  failed: { label: "Failed", tone: "danger" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};

export const targetStatusMeta: Record<UploadTargetStatus, StatusMeta> = {
  pending: { label: "Waiting", tone: "neutral", pulse: true },
  uploading: { label: "Uploading", tone: "info", pulse: true },
  retrying: { label: "Retrying", tone: "warning", pulse: true },
  done: { label: "Published", tone: "success" },
  failed: { label: "Failed", tone: "danger" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};

export const thumbnailStatusLabel: Record<ThumbnailStatus, string | null> = {
  none: null,
  pending: "Thumbnail pending",
  done: "Thumbnail set",
  failed: "Thumbnail failed",
};

export const errorHints: Record<string, string> = {
  network_error: "The connection was interrupted. Retry to try again.",
  youtube_unavailable: "YouTube had a temporary problem. Retry in a few minutes.",
  storage_unavailable: "Temporary storage could not be reached. Retry in a moment.",
  source_unreadable: "The video could not be read from temporary storage. Retry in a moment.",
  quota_exceeded:
    "The daily limit of the Google project was reached. This channel continues by itself after the reset, or you can retry later.",
  channel_upload_limit: "This channel reached its own daily upload limit on YouTube.",
  reconnect_required: "Reconnect this account from YouTube Accounts, then retry.",
  account_unavailable: "This account was disconnected or removed.",
  invalid_video_details: "YouTube rejected the title, description, tags or schedule.",
  no_youtube_channel: "The Google account has no YouTube channel.",
  forbidden: "YouTube refused the request for this channel.",
  rejected_by_youtube: "YouTube rejected this video.",
  source_missing: "The video file is no longer stored. Publish it again.",
  media_expired: "The video file is no longer stored. Publish it again.",
  media_upload_incomplete:
    "The video was not fully uploaded from the browser in time. Publish it again.",
  invalid_video_file: "The file is not a valid video. Publish again with a different file.",
  interrupted: "The upload was interrupted repeatedly. Retry to start again.",
  unexpected_error: "An unexpected error occurred. Retry, or contact support if it continues.",
};

export const YOUTUBE_CATEGORIES = [
  { id: "1", label: "Film & Animation" },
  { id: "2", label: "Autos & Vehicles" },
  { id: "10", label: "Music" },
  { id: "15", label: "Pets & Animals" },
  { id: "17", label: "Sports" },
  { id: "19", label: "Travel & Events" },
  { id: "20", label: "Gaming" },
  { id: "22", label: "People & Blogs" },
  { id: "23", label: "Comedy" },
  { id: "24", label: "Entertainment" },
  { id: "25", label: "News & Politics" },
  { id: "26", label: "How-to & Style" },
  { id: "27", label: "Education" },
  { id: "28", label: "Science & Technology" },
  { id: "29", label: "Nonprofits & Activism" },
] as const;

export const LANGUAGES = [
  { code: "", label: "Not specified" },
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "pt", label: "Portuguese" },
  { code: "it", label: "Italian" },
  { code: "ru", label: "Russian" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "id", label: "Indonesian" },
  { code: "tr", label: "Turkish" },
  { code: "ar", label: "Arabic" },
  { code: "bn", label: "Bengali" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "mr", label: "Marathi" },
] as const;

export function categoryLabel(id: string): string {
  return YOUTUBE_CATEGORIES.find((category) => category.id === id)?.label ?? `Category ${id}`;
}
