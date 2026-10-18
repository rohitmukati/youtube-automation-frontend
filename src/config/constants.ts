import { env } from "@/config/env";

export const REFRESH_COOKIE = "ya_refresh";
export const REFRESH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
export const ACCESS_TOKEN_SKEW_MS = 30_000;

export const AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"] as const;
export const PROTECTED_PREFIXES = [
  "/dashboard",
  "/accounts",
  "/storage",
  "/uploads",
  "/settings",
  "/youtube",
] as const;

export const LIMITS = {
  videoBytes: env.maxVideoMb * 1024 * 1024,
  imageBytes: env.maxImageMb * 1024 * 1024,
  thumbnailBytes: 2 * 1024 * 1024,
  titleMax: 100,
  descriptionMaxBytes: 5000,
  tagMax: 30,
  tagsTotalMax: 500,
  maxChannelsPerUpload: 50,
  nicknameMax: 100,
  notesMax: 1000,
  otpLength: 6,
  resendCooldownSeconds: 60,
  storagePageSize: 24,
  historyPageSize: 15,
} as const;

export const FILE_TYPES = {
  video: {
    mime: [
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "video/x-matroska",
      "video/webm",
      "video/mpeg",
    ],
    extensions: [".mp4", ".mov", ".avi", ".mkv", ".webm", ".mpeg", ".mpg"],
  },
  image: {
    mime: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    extensions: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
  },
} as const;

export const POLL_INTERVALS = {
  activeJob: 2500,
  activeList: 5000,
} as const;

export const ACTIVE_JOB_STATUSES = ["queued", "running"] as const;
