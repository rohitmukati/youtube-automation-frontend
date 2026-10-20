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
  message?: string | null;
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
  message: string | null;
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

export type AnalyticsSyncStatus = "idle" | "running" | "completed" | "failed";
export type AnalyticsRange = { days?: number; start_date?: string; end_date?: string };

export interface AnalyticsSync {
  account_id: UUID;
  status: AnalyticsSyncStatus;
  started_at: string | null;
  finished_at: string | null;
  last_synced_at: string | null;
  videos_synced: number;
  error: string | null;
  is_stale: boolean;
}

export interface AnalyticsChannel {
  account_id: UUID;
  nickname: string;
  channel_id: string;
  channel_title: string;
  channel_thumbnail_url: string | null;
  google_email: string | null;
  channel_url: string;
  subscribers: number | null;
  hidden_subscriber_count: boolean;
  total_views: number;
  channel_video_count: number;
  snapshot_date: string | null;
  growth: {
    subscribers_7d: number | null;
    subscribers_28d: number | null;
    subscribers_90d: number | null;
    views_7d: number | null;
    views_28d: number | null;
    views_90d: number | null;
  };
  videos: {
    total: number;
    public: number;
    unlisted: number;
    private: number;
    shorts: number;
    long_form: number;
  };
  video_totals: {
    views: number;
    likes: number;
    comments: number;
    median_views: number;
    average_engagement_rate: number;
  };
  analytics_enabled: boolean;
  needs_reconnect: boolean;
  has_data: boolean;
  sync: AnalyticsSync;
}

export interface AnalyticsOverview {
  total_channels: number;
  total_subscribers: number;
  total_views: number;
  total_videos: number;
  channels: Array<{
    account_id: UUID;
    nickname: string;
    channel_title: string;
    channel_thumbnail_url: string | null;
    subscribers: number | null;
    total_views: number;
    channel_video_count: number;
    synced_videos: number;
    recent_uploads_30d: number;
    subscribers_28d: number | null;
    views_28d: number | null;
    average_performance_index: number | null;
    last_published_at: string | null;
    top_video: {
      video_id: string;
      title: string;
      views: number;
      thumbnail_url: string | null;
    } | null;
    analytics_enabled: boolean;
    needs_reconnect: boolean;
    sync: AnalyticsSync;
  }>;
}

export interface AnalyticsMetrics {
  views: number;
  estimated_minutes_watched: number;
  watch_time_hours: number;
  average_view_duration_seconds: number;
  average_view_percentage: number;
  likes: number;
  comments: number;
  shares: number;
  subscribers_gained: number;
  subscribers_lost: number;
  net_subscribers: number;
  engagement_rate: number;
}

export interface AnalyticsDailyRow {
  date: string;
  views: number;
  estimated_minutes_watched: number;
  average_view_duration_seconds: number;
  average_view_percentage: number;
  likes: number;
  comments: number;
  shares: number;
  subscribers_gained: number;
  subscribers_lost: number;
}

export interface AnalyticsPerformance {
  start_date: string;
  end_date: string;
  previous_start_date: string;
  previous_end_date: string;
  current: AnalyticsMetrics;
  previous: AnalyticsMetrics;
  change_percent: Record<keyof AnalyticsMetrics, number | null>;
  daily: AnalyticsDailyRow[];
  data_delay_days: number;
  fetched_at: string;
}

export interface AnalyticsTopVideo {
  video_id: string;
  title: string;
  thumbnail_url: string | null;
  published_at: string | null;
  is_short: boolean;
  views: number;
  estimated_minutes_watched: number;
  average_view_duration_seconds: number;
  average_view_percentage: number;
  likes: number | null;
  comments: number | null;
  shares: number;
  subscribers_gained: number;
  performance_index: number | null;
  youtube_url: string;
}

export type AnalyticsVideoSort =
  "published_at" | "views" | "likes" | "comments" | "engagement" | "performance" | "duration";

export interface AnalyticsVideoListParams {
  search?: string;
  content_type?: "all" | "short" | "long";
  privacy_status?: PrivacyStatus;
  date_from?: string;
  date_to?: string;
  sort?: AnalyticsVideoSort;
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface AnalyticsVideo {
  video_id: string;
  title: string;
  tags: string[];
  category_id: string | null;
  default_language: string | null;
  published_at: string | null;
  duration_seconds: number;
  is_short: boolean;
  privacy_status: PrivacyStatus;
  thumbnail_url: string | null;
  view_count: number;
  like_count: number | null;
  comment_count: number | null;
  engagement_rate: number;
  performance_index: number | null;
  stats_synced_at: string | null;
  youtube_url: string;
}

export interface AnalyticsVideoList {
  videos: AnalyticsVideo[];
  total: number;
  limit: number;
  offset: number;
}

export interface AvailableRows<T> {
  available: boolean;
  message: string | null;
  rows: T[];
}

export interface AnalyticsSimpleRow {
  key: string;
  views: number;
  estimated_minutes_watched: number;
  share_percent: number;
}

export interface AnalyticsDemographicRow {
  age_group: string;
  gender: string;
  viewer_percentage: number;
}

export interface AnalyticsVideoAnalytics {
  video_id: string;
  start_date: string | null;
  end_date: string | null;
  totals: AnalyticsMetrics;
  daily: AvailableRows<AnalyticsDailyRow>;
  retention: AvailableRows<{
    elapsed_ratio: number;
    audience_watch_ratio: number;
    relative_retention_performance: number;
  }>;
  traffic_sources: AvailableRows<AnalyticsSimpleRow>;
  search_terms: AvailableRows<AnalyticsSimpleRow>;
  demographics: AvailableRows<AnalyticsDemographicRow>;
  fetched_at: string;
}

export interface AnalyticsVideoDetail {
  account_id: UUID;
  video: AnalyticsVideo;
  description: string;
  comparison: {
    rank_by_views: number | null;
    total_videos: number;
    channel_median_views: number;
    channel_average_engagement_rate: number;
    views_vs_median: number | null;
    engagement_vs_average: number | null;
    performance_label: "outperforming" | "typical" | "underperforming" | "not_enough_data";
  };
}

export interface AnalyticsComments {
  comments: Array<{
    text: string;
    like_count: number;
    reply_count: number;
    published_at: string;
  }>;
  comments_disabled: boolean;
}

export interface AnalyticsAudience {
  demographics: AvailableRows<AnalyticsDemographicRow>;
  countries: AvailableRows<{
    country: string;
    views: number;
    estimated_minutes_watched: number;
    average_view_duration_seconds: number;
    subscribers_gained: number;
    share_percent: number;
  }>;
  devices: AvailableRows<AnalyticsSimpleRow>;
  subscribed_status: AvailableRows<AnalyticsSimpleRow>;
}

export interface AnalyticsTraffic {
  sources: AvailableRows<AnalyticsSimpleRow>;
  search_terms: AvailableRows<AnalyticsSimpleRow>;
  content_types: AvailableRows<AnalyticsSimpleRow>;
}

export interface AnalyticsPublishing {
  content_type: string;
  timezone: string;
  sample_size: number;
  confidence: "none" | "low" | "medium" | "high";
  best_weekday: string | null;
  best_hour: number | null;
  best_day_part: string | null;
  best_slots: Array<{
    weekday: number;
    label: string;
    hour: number;
    videos: number;
    median_performance_index: number;
    median_views: number;
  }>;
  by_weekday: Array<{
    weekday: number;
    label: string;
    videos: number;
    median_performance_index: number;
    median_views: number;
  }>;
  by_hour: Array<{
    hour: number;
    videos: number;
    median_performance_index: number;
    median_views: number;
  }>;
  by_day_part: Array<{
    day_part: string;
    hours: string;
    videos: number;
    median_performance_index: number;
    median_views: number;
  }>;
  heatmap: Array<{
    weekday: number;
    hour: number;
    videos: number;
    median_performance_index: number;
    median_views: number;
  }>;
  cadence: {
    total_videos: number;
    first_published_at: string | null;
    last_published_at: string | null;
    days_since_last_upload: number | null;
    uploads_last_30_days: number;
    uploads_previous_30_days: number;
    median_days_between_uploads: number | null;
    uploads_per_month: Array<{ month: string; videos: number }>;
  };
  note: string | null;
}

export interface AnalyticsContentInsights {
  content_type: string;
  sample_size: number;
  confidence: string;
  best_videos: Array<{
    video_id: string;
    title: string;
    published_at: string | null;
    duration_seconds: number;
    is_short: boolean;
    views: number;
    likes: number | null;
    comments: number | null;
    engagement_rate: number;
    performance_index: number | null;
    tags: string[];
  }>;
  worst_videos: AnalyticsContentInsights["best_videos"];
  tags: {
    videos_with_tags: number;
    videos_without_tags: number;
    average_tags_per_video: number;
    top_tags: Array<{
      tag: string;
      videos: number;
      scored_videos: number;
      median_performance_index: number | null;
      average_views: number;
    }>;
    weak_tags: AnalyticsContentInsights["tags"]["top_tags"];
    most_used_tags: AnalyticsContentInsights["tags"]["top_tags"];
    tag_count_groups: Array<{
      label: string;
      videos: number;
      median_performance_index: number;
      median_views: number;
    }>;
    note: string | null;
  };
  titles: {
    average_title_length: number;
    length_groups: Array<{
      label: string;
      videos: number;
      median_performance_index: number;
      median_views: number;
    }>;
    features: Array<{
      feature: string;
      videos_with: number;
      videos_without: number;
      median_index_with: number;
      median_index_without: number;
      lift: number;
    }>;
  };
  durations: Array<{
    label: string;
    videos: number;
    median_performance_index: number;
    median_views: number;
  }>;
  note: string | null;
}

export type AIReportType =
  | "channel_strategy"
  | "content_analysis"
  | "publishing_schedule"
  | "audience_keywords"
  | "comments_insights"
  | "content_plan"
  | "video_review"
  | "portfolio";
export type AILanguage = "en" | "hinglish";

export interface AIReportSummary {
  id: UUID;
  account_id: UUID | null;
  video_id: string | null;
  report_type: AIReportType;
  period_days: number;
  language: AILanguage;
  model: string;
  created_at: string;
  headline: string;
  score: number | null;
}

export interface AIReport extends AIReportSummary {
  cached: boolean;
  content: {
    headline: string;
    summary: string;
    score: number | null;
    score_explanation: string | null;
    strengths: string[];
    weaknesses: string[];
    insights: Array<{
      title: string;
      category: string;
      finding: string;
      evidence: string;
      recommendation: string;
      action_steps: string[];
      priority: "high" | "medium" | "low";
      impact: "high" | "medium" | "low";
      effort: "high" | "medium" | "low";
      confidence: "high" | "medium" | "low";
    }>;
    quick_wins: string[];
    content_ideas: Array<{
      title: string;
      format: string;
      hook: string;
      why_it_should_work: string;
      based_on: string;
    }>;
    experiments: Array<{ hypothesis: string; how_to_test: string; success_metric: string }>;
    data_limitations: string[];
  };
  data_quality: {
    period_days: number;
    start_date: string | null;
    end_date: string | null;
    analytics_available: boolean;
    videos_in_database: number;
    last_synced_at: string | null;
    sections_missing: string[];
    generated_at: string;
    [key: string]: unknown;
  };
}

export interface AIReportList {
  reports: AIReportSummary[];
  total: number;
  limit: number;
  offset: number;
}
