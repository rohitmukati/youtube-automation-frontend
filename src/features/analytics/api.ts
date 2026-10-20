import { api } from "@/lib/api/client";
import type {
  AIReport,
  AIReportList,
  AnalyticsAudience,
  AnalyticsChannel,
  AnalyticsComments,
  AnalyticsContentInsights,
  AnalyticsOverview,
  AnalyticsPerformance,
  AnalyticsPublishing,
  AnalyticsRange,
  AnalyticsSync,
  AnalyticsTopVideo,
  AnalyticsTraffic,
  AnalyticsVideoAnalytics,
  AnalyticsVideoDetail,
  AnalyticsVideoList,
  AnalyticsVideoListParams,
  AIReportType,
  UUID,
} from "@/types/api";

const root = "/yt-analytics";
const accountPath = (id: string) => `${root}/accounts/${encodeURIComponent(id)}`;

export const analyticsApi = {
  async overview(): Promise<AnalyticsOverview> {
    const { data } = await api.get<AnalyticsOverview>(`${root}/overview`);
    return data;
  },
  async channel(id: string): Promise<AnalyticsChannel> {
    const { data } = await api.get<AnalyticsChannel>(`${accountPath(id)}/channel`);
    return data;
  },
  async syncStatus(id: string): Promise<AnalyticsSync> {
    const { data } = await api.get<AnalyticsSync>(`${accountPath(id)}/sync`);
    return data;
  },
  async sync(id: string): Promise<AnalyticsSync> {
    const { data } = await api.post<AnalyticsSync>(`${accountPath(id)}/sync`);
    return data;
  },
  async performance(id: string, range: AnalyticsRange): Promise<AnalyticsPerformance> {
    const { data } = await api.get<AnalyticsPerformance>(`${accountPath(id)}/performance`, {
      params: range,
    });
    return data;
  },
  async audience(id: string, range: AnalyticsRange): Promise<AnalyticsAudience> {
    const { data } = await api.get<AnalyticsAudience>(`${accountPath(id)}/audience`, {
      params: range,
    });
    return data;
  },
  async traffic(id: string, range: AnalyticsRange): Promise<AnalyticsTraffic> {
    const { data } = await api.get<AnalyticsTraffic>(`${accountPath(id)}/traffic`, {
      params: range,
    });
    return data;
  },
  async topVideos(
    id: string,
    params: AnalyticsRange & { limit?: number },
  ): Promise<{ videos: AnalyticsTopVideo[] }> {
    const { data } = await api.get<{ videos: AnalyticsTopVideo[] }>(
      `${accountPath(id)}/top-videos`,
      { params },
    );
    return data;
  },
  async videos(id: string, params: AnalyticsVideoListParams): Promise<AnalyticsVideoList> {
    const { data } = await api.get<AnalyticsVideoList>(`${accountPath(id)}/videos`, { params });
    return data;
  },
  async video(id: string, videoId: string): Promise<AnalyticsVideoDetail> {
    const { data } = await api.get<AnalyticsVideoDetail>(
      `${accountPath(id)}/videos/${encodeURIComponent(videoId)}`,
    );
    return data;
  },
  async videoAnalytics(
    id: string,
    videoId: string,
    range: AnalyticsRange,
  ): Promise<AnalyticsVideoAnalytics> {
    const { data } = await api.get<AnalyticsVideoAnalytics>(
      `${accountPath(id)}/videos/${encodeURIComponent(videoId)}/analytics`,
      { params: range },
    );
    return data;
  },
  async comments(id: string, videoId: string): Promise<AnalyticsComments> {
    const { data } = await api.get<AnalyticsComments>(
      `${accountPath(id)}/videos/${encodeURIComponent(videoId)}/comments`,
    );
    return data;
  },
  async publishing(
    id: string,
    params: { timezone?: string; content_type?: string },
  ): Promise<AnalyticsPublishing> {
    const { data } = await api.get<AnalyticsPublishing>(`${accountPath(id)}/insights/publishing`, {
      params,
    });
    return data;
  },
  async content(id: string, params: { content_type?: string }): Promise<AnalyticsContentInsights> {
    const { data } = await api.get<AnalyticsContentInsights>(
      `${accountPath(id)}/insights/content`,
      { params },
    );
    return data;
  },
  async reports(params: {
    account_id?: string;
    video_id?: string;
    report_type?: AIReportType;
    limit?: number;
    offset?: number;
  }): Promise<AIReportList> {
    const { data } = await api.get<AIReportList>(`${root}/ai-reports`, { params });
    return data;
  },
  async report(id: string): Promise<AIReport> {
    const { data } = await api.get<AIReport>(`${root}/ai-reports/${encodeURIComponent(id)}`);
    return data;
  },
  async createReport(
    id: string,
    payload: {
      report_type: AIReportType;
      days?: number;
      language?: "en" | "hinglish";
      video_id?: string;
      timezone?: string;
      force?: boolean;
    },
  ): Promise<AIReport> {
    const { data } = await api.post<AIReport>(`${accountPath(id)}/ai-reports`, payload, {
      timeout: 120_000,
    });
    return data;
  },
  async createPortfolioReport(payload: {
    days?: number;
    language?: "en" | "hinglish";
    force?: boolean;
  }): Promise<AIReport> {
    const { data } = await api.post<AIReport>(`${root}/ai-reports/portfolio`, payload, {
      timeout: 120_000,
    });
    return data;
  },
  async deleteReport(id: UUID): Promise<void> {
    await api.delete(`${root}/ai-reports/${encodeURIComponent(id)}`);
  },
};

export type { AnalyticsRange };
