export const queryKeys = {
  me: ["me"] as const,
  accounts: {
    all: ["accounts"] as const,
    list: () => ["accounts", "list"] as const,
  },
  credentials: ["youtube", "credentials"] as const,
  storage: {
    all: ["storage"] as const,
    list: (params: unknown) => ["storage", "list", params] as const,
  },
  uploads: {
    all: ["uploads"] as const,
    list: (params: unknown) => ["uploads", "list", params] as const,
    detail: (id: string) => ["uploads", "detail", id] as const,
    quota: () => ["uploads", "quota"] as const,
  },
  analytics: {
    all: ["yt-analytics"] as const,
    account: (accountId: string) => ["yt-analytics", "account", accountId] as const,
    channel: (accountId: string) => ["yt-analytics", "account", accountId, "channel"] as const,
    sync: (accountId: string) => ["yt-analytics", "account", accountId, "sync"] as const,
    performance: (accountId: string, params: unknown) =>
      ["yt-analytics", "account", accountId, "performance", params] as const,
    audience: (accountId: string, params: unknown) =>
      ["yt-analytics", "account", accountId, "audience", params] as const,
    traffic: (accountId: string, params: unknown) =>
      ["yt-analytics", "account", accountId, "traffic", params] as const,
    topVideos: (accountId: string, params: unknown) =>
      ["yt-analytics", "account", accountId, "top-videos", params] as const,
    videos: (accountId: string, params: unknown) =>
      ["yt-analytics", "account", accountId, "videos", params] as const,
    video: (accountId: string, videoId: string) =>
      ["yt-analytics", "account", accountId, "videos", videoId] as const,
    videoAnalytics: (accountId: string, videoId: string, params: unknown) =>
      ["yt-analytics", "account", accountId, "videos", videoId, "analytics", params] as const,
    videoComments: (accountId: string, videoId: string) =>
      ["yt-analytics", "account", accountId, "videos", videoId, "comments"] as const,
    publishing: (accountId: string, params: unknown) =>
      ["yt-analytics", "account", accountId, "insights", "publishing", params] as const,
    content: (accountId: string, params: unknown) =>
      ["yt-analytics", "account", accountId, "insights", "content", params] as const,
    overview: () => ["yt-analytics", "overview"] as const,
    reports: (params: unknown) => ["yt-analytics", "ai-reports", params] as const,
    report: (reportId: string) => ["yt-analytics", "ai-report", reportId] as const,
  },
  health: ["health"] as const,
};
