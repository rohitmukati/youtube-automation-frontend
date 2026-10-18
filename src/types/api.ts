export type UUID = string;

export interface FieldIssue {
  field: string;
  message: string;
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: FieldIssue[];
  };
}

export interface MessageResponse {
  message: string;
}

export interface User {
  id: UUID;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthResponse {
  user: User;
  tokens: TokenPair;
}

export interface SessionPayload {
  user: User;
  accessToken: string;
  expiresIn: number;
}

export interface RefreshPayload {
  accessToken: string;
  expiresIn: number;
}

export interface YouTubeAccount {
  id: UUID;
  nickname: string;
  channel_id: string;
  channel_title: string;
  channel_thumbnail_url: string | null;
  google_email: string | null;
  notes: string | null;
  is_active: boolean;
  needs_reconnect: boolean;
  last_used_at: string | null;
  created_at: string;
}

export interface AccountListResponse {
  accounts: YouTubeAccount[];
  total: number;
}

export interface ConnectInitiateResponse {
  auth_url: string;
  message: string;
}

export interface YouTubeCredentialsResponse {
  configured: boolean;
  client_id: string | null;
  client_secret_saved: boolean;
  redirect_uri: string;
  updated_at: string | null;
}

export interface YouTubeCredentialsPayload {
  client_id: string;
  client_secret: string;
}

export interface YouTubeCredentialsStatus {
  configured: boolean;
  clientId: string | null;
  redirectUrl: string | null;
  updatedAt: string | null;
}

export type StorageFileType = "video" | "image";

export interface StorageFile {
  id: UUID;
  file_type: StorageFileType;
  original_name: string;
  content_type: string;
  size_bytes: number;
  tags: string[];
  signed_url: string | null;
  created_at: string;
}

export interface StorageFileListResponse {
  files: StorageFile[];
  total: number;
  limit: number;
  offset: number;
}

export type PrivacyStatus = "public" | "unlisted" | "private";
export type UploadJobStatus =
  "queued" | "running" | "completed" | "partially_completed" | "failed" | "cancelled";
export type UploadTargetStatus =
  "pending" | "uploading" | "retrying" | "done" | "failed" | "cancelled";
export type ThumbnailStatus = "none" | "pending" | "done" | "failed";

export interface CreateUploadRequest {
  storage_file_id: UUID;
  account_ids: UUID[];
  title: string;
  description: string;
  tags: string[];
  category_id: string;
  privacy_status: PrivacyStatus;
  publish_at: string | null;
  made_for_kids: boolean;
  default_language: string | null;
  notify_subscribers: boolean;
  thumbnail_file_id: UUID | null;
}

export interface UploadTarget {
  id: UUID;
  account_id: UUID | null;
  account_nickname: string;
  account_email: string | null;
  channel_id: string;
  channel_title: string;
  status: UploadTargetStatus;
  progress_percent: number;
  attempts: number;
  max_attempts: number;
  next_attempt_at: string | null;
  youtube_video_id: string | null;
  youtube_url: string | null;
  thumbnail_status: ThumbnailStatus;
  thumbnail_error: string | null;
  error_code: string | null;
  error_message: string | null;
  started_at: string | null;
  finished_at: string | null;
}

export interface UploadJobSummary {
  id: UUID;
  status: UploadJobStatus;
  title: string;
  privacy_status: PrivacyStatus;
  storage_file_id: UUID | null;
  source_file_name: string;
  source_size_bytes: number;
  total_channels: number;
  done_count: number;
  failed_count: number;
  cancelled_count: number;
  active_count: number;
  created_at: string;
  updated_at: string;
}

export interface UploadJobDetail extends UploadJobSummary {
  description: string;
  tags: string[];
  category_id: string;
  publish_at: string | null;
  made_for_kids: boolean;
  default_language: string | null;
  notify_subscribers: boolean;
  source_content_type: string;
  thumbnail_file_id: UUID | null;
  thumbnail_file_name: string | null;
  targets: UploadTarget[];
}

export interface UploadChannelBrief {
  account_id: UUID | null;
  account_nickname: string;
  account_email: string | null;
  channel_title: string;
  status: UploadTargetStatus;
  youtube_url: string | null;
}

export interface UploadJobListItem extends UploadJobSummary {
  channels: UploadChannelBrief[];
}

export interface UploadJobListResponse {
  jobs: UploadJobListItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface UploadQuota {
  daily_limit: number;
  used_today: number;
  waiting: number;
  remaining: number;
  resets_at: string;
}