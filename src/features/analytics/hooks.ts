"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import { analyticsApi } from "@/features/analytics/api";
import { queryKeys } from "@/lib/query-keys";
import type { AIReportType, AnalyticsRange, AnalyticsVideoListParams, UUID } from "@/types/api";

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: queryKeys.analytics.overview(),
    queryFn: analyticsApi.overview,
    staleTime: 3 * 60_000,
  });
}

export function useAnalyticsChannel(accountId: string) {
  return useQuery({
    queryKey: queryKeys.analytics.channel(accountId),
    queryFn: () => analyticsApi.channel(accountId),
    enabled: Boolean(accountId),
    staleTime: 3 * 60_000,
  });
}

export function useAnalyticsSyncStatus(accountId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.analytics.sync(accountId),
    queryFn: () => analyticsApi.syncStatus(accountId),
    enabled: Boolean(accountId) && enabled,
    staleTime: 2_000,
    refetchInterval: (query) => (query.state.data?.status === "running" ? 3_000 : false),
  });
}

export function useStartAnalyticsSync(accountId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => analyticsApi.sync(accountId),
    onSuccess: async (sync) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.analytics.sync(accountId) });
      queryClient.setQueryData(queryKeys.analytics.sync(accountId), sync);
    },
  });
}

export function useAnalyticsPerformance(accountId: string, range: AnalyticsRange) {
  return useQuery({
    queryKey: queryKeys.analytics.performance(accountId, range),
    queryFn: () => analyticsApi.performance(accountId, range),
    enabled: Boolean(accountId),
    staleTime: 3 * 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useAnalyticsAudience(accountId: string, range: AnalyticsRange) {
  return useQuery({
    queryKey: queryKeys.analytics.audience(accountId, range),
    queryFn: () => analyticsApi.audience(accountId, range),
    enabled: Boolean(accountId),
    staleTime: 3 * 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useAnalyticsTraffic(accountId: string, range: AnalyticsRange) {
  return useQuery({
    queryKey: queryKeys.analytics.traffic(accountId, range),
    queryFn: () => analyticsApi.traffic(accountId, range),
    enabled: Boolean(accountId),
    staleTime: 3 * 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useAnalyticsTopVideos(
  accountId: string,
  params: AnalyticsRange & { limit?: number },
) {
  return useQuery({
    queryKey: queryKeys.analytics.topVideos(accountId, params),
    queryFn: () => analyticsApi.topVideos(accountId, params),
    enabled: Boolean(accountId),
    staleTime: 3 * 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useAnalyticsVideos(accountId: string, params: AnalyticsVideoListParams) {
  return useQuery({
    queryKey: queryKeys.analytics.videos(accountId, params),
    queryFn: () => analyticsApi.videos(accountId, params),
    enabled: Boolean(accountId),
    staleTime: 3 * 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useAnalyticsVideo(accountId: string, videoId: string) {
  return useQuery({
    queryKey: queryKeys.analytics.video(accountId, videoId),
    queryFn: () => analyticsApi.video(accountId, videoId),
    enabled: Boolean(accountId && videoId),
    staleTime: 3 * 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useAnalyticsVideoData(
  accountId: string,
  videoId: string,
  range: AnalyticsRange = {},
) {
  return useQuery({
    queryKey: queryKeys.analytics.videoAnalytics(accountId, videoId, range),
    queryFn: () => analyticsApi.videoAnalytics(accountId, videoId, range),
    enabled: Boolean(accountId && videoId),
    staleTime: 3 * 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useAnalyticsComments(accountId: string, videoId: string) {
  return useQuery({
    queryKey: queryKeys.analytics.videoComments(accountId, videoId),
    queryFn: () => analyticsApi.comments(accountId, videoId),
    enabled: Boolean(accountId && videoId),
    staleTime: 3 * 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useAnalyticsPublishing(
  accountId: string,
  params: { timezone?: string; content_type?: string },
) {
  return useQuery({
    queryKey: queryKeys.analytics.publishing(accountId, params),
    queryFn: () => analyticsApi.publishing(accountId, params),
    enabled: Boolean(accountId),
    staleTime: 3 * 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useAnalyticsContent(accountId: string, params: { content_type?: string }) {
  return useQuery({
    queryKey: queryKeys.analytics.content(accountId, params),
    queryFn: () => analyticsApi.content(accountId, params),
    enabled: Boolean(accountId),
    staleTime: 3 * 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useAIReports(params: {
  account_id?: string;
  video_id?: string;
  report_type?: AIReportType;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: queryKeys.analytics.reports(params),
    queryFn: () => analyticsApi.reports(params),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useAIReport(reportId: string) {
  return useQuery({
    queryKey: queryKeys.analytics.report(reportId),
    queryFn: () => analyticsApi.report(reportId),
    enabled: Boolean(reportId),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}

export function useCreateAIReport(accountId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof analyticsApi.createReport>[1]) =>
      analyticsApi.createReport(accountId, payload),
    onSuccess: async (report) => {
      queryClient.setQueryData(queryKeys.analytics.report(report.id), report);
      await queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
    },
  });
}

export function useCreatePortfolioReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: analyticsApi.createPortfolioReport,
    onSuccess: async (report) => {
      queryClient.setQueryData(queryKeys.analytics.report(report.id), report);
      await queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
    },
  });
}

export function useDeleteAIReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: UUID) => analyticsApi.deleteReport(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
    },
  });
}

const languageEvent = "analytics-ai-language-change";

function subscribeLanguage(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(languageEvent, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(languageEvent, callback);
  };
}

function getLanguage(): "en" | "hinglish" {
  const language = window.localStorage.getItem("analytics-ai-language");
  return language === "hinglish" ? "hinglish" : "en";
}

export function useAILanguage(): ["en" | "hinglish", (language: "en" | "hinglish") => void] {
  const language = useSyncExternalStore<"en" | "hinglish">(
    subscribeLanguage,
    getLanguage,
    () => "en",
  );
  function setLanguage(value: "en" | "hinglish") {
    window.localStorage.setItem("analytics-ai-language", value);
    window.dispatchEvent(new Event(languageEvent));
  }
  return [language, setLanguage];
}

function subscribeTimezone() {
  return () => {};
}

function getBrowserTimezone() {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
  return timezone === "Asia/Calcutta" ? "Asia/Kolkata" : timezone;
}

export function useBrowserTimezone(): string {
  return useSyncExternalStore(subscribeTimezone, getBrowserTimezone, () => "Asia/Kolkata");
}
