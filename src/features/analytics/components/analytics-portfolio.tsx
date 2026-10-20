"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { AIReportView } from "@/features/analytics/components/ai-report-view";
import { analyticsApi } from "@/features/analytics/api";
import {
  AnalyticsError,
  AnalyticsLoading,
  formatCount,
} from "@/features/analytics/components/analytics-primitives";
import {
  useAIReport,
  useAIReports,
  useAILanguage,
  useAnalyticsOverview,
  useCreatePortfolioReport,
  useDeleteAIReport,
} from "@/features/analytics/hooks";
import { getErrorMessage, toApiError } from "@/lib/api/errors";
import { formatDate, formatDateTime } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import type { AIReport, AILanguage } from "@/types/api";

type SortField =
  "subscribers" | "views" | "recent_uploads_30d" | "growth" | "average_performance_index";

export function AnalyticsPortfolio() {
  const query = useAnalyticsOverview();
  const queryClient = useQueryClient();
  const create = useCreatePortfolioReport();
  const savedReports = useAIReports({ report_type: "portfolio", limit: 20, offset: 0 });
  const deleteReport = useDeleteAIReport();
  const [sort, setSort] = React.useState<SortField>("views");
  const [language, setLanguage] = useAILanguage();
  const [days, setDays] = React.useState(28);
  const [syncingChannels, setSyncingChannels] = React.useState(false);
  const [activeReport, setActiveReport] = React.useState<AIReport | null>(null);
  const [reportId, setReportId] = React.useState("");
  const fetchedReport = useAIReport(activeReport ? "" : reportId);

  const report = activeReport ?? fetchedReport.data;
  const aiError = create.error ? toApiError(create.error) : null;
  const aiUnavailable = aiError?.code === "ai_not_configured";

  function generate(force = false) {
    create.mutate(
      { days, language, force },
      {
        onSuccess: (result) => {
          setActiveReport(result);
          setReportId("");
        },
      },
    );
  }

  async function removeReport(id: string) {
    try {
      await deleteReport.mutateAsync(id);
      if (reportId === id) setReportId("");
      toast.success("Report deleted.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function syncPortfolioChannels() {
    const channels =
      query.data?.channels.filter(
        (channel) => !channel.needs_reconnect && channel.sync.status !== "running",
      ) ?? [];
    if (channels.length === 0) {
      toast.error("No channels are available to sync. Reconnect any channels that need attention.");
      return;
    }
    setSyncingChannels(true);
    const failures: string[] = [];
    for (const channel of channels) {
      try {
        const syncResult = await analyticsApi.sync(channel.account_id);
        if (syncResult.status === "failed") {
          failures.push(
            `${channel.channel_title}: ${syncResult.error || "The channel sync failed."}`,
          );
        }
      } catch (error) {
        failures.push(`${channel.channel_title}: ${getErrorMessage(error)}`);
      }
    }
    await queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
    setSyncingChannels(false);
    if (failures.length > 0) {
      toast.error(failures.join(" "));
    } else {
      toast.success("Channel syncs started.");
    }
  }

  if (query.isLoading && !query.data) return <AnalyticsLoading rows={4} />;
  if (query.isError && !query.data) {
    return <AnalyticsError error={query.error} retry={() => void query.refetch()} />;
  }
  if (!query.data) return <AnalyticsLoading rows={4} />;

  const rows = [...query.data.channels].sort((a, b) => {
    const read = (channel: (typeof query.data.channels)[number]) => {
      if (sort === "subscribers") return channel.subscribers ?? -1;
      if (sort === "views") return channel.total_views;
      if (sort === "recent_uploads_30d") return channel.recent_uploads_30d;
      if (sort === "growth") return channel.views_28d ?? -1;
      return channel.average_performance_index ?? -1;
    };
    return read(b) - read(a);
  });

  return (
    <div className="flex flex-col gap-6">
      {query.isError ? (
        <AnalyticsError error={query.error} retry={() => void query.refetch()} />
      ) : null}
      <PageHeader
        title="All channels"
        description="Compare performance and growth across your connected YouTube channels."
        actions={
          <>
            <label className="text-body flex items-center gap-2 text-sm">
              Language
              <select
                className="border-border-strong bg-background text-foreground h-10 rounded-full border px-3"
                value={language}
                onChange={(event) => {
                  const value = event.target.value as AILanguage;
                  setLanguage(value);
                }}
              >
                <option value="en">English</option>
                <option value="hinglish">Hinglish</option>
              </select>
            </label>
            <label className="text-body flex items-center gap-2 text-sm">
              Period
              <select
                className="border-border-strong bg-background text-foreground h-10 rounded-full border px-3"
                value={days}
                onChange={(event) => setDays(Number(event.target.value))}
              >
                {[7, 28, 90, 180, 365].map((period) => (
                  <option key={period} value={period}>
                    {period} days
                  </option>
                ))}
              </select>
            </label>
            {!aiUnavailable ? (
              <Button loading={create.isPending} onClick={() => generate(false)}>
                AI portfolio review
              </Button>
            ) : null}
            {savedReports.data?.reports[0] ? (
              <Button
                variant="outline"
                onClick={() => {
                  setActiveReport(null);
                  setReportId(savedReports.data?.reports[0].id ?? "");
                }}
              >
                View latest report
              </Button>
            ) : null}
          </>
        }
      />

      {create.isPending ? (
        <Alert tone="info" title="Analysing your channel portfolio">
          This can take up to a minute. Keep this page open while the report is generated.
        </Alert>
      ) : null}
      {aiError ? (
        <PortfolioAIError
          error={create.error}
          unavailable={aiUnavailable}
          retry={() => create.mutate(create.variables ?? { days, language })}
          onSync={() => void syncPortfolioChannels()}
          syncing={syncingChannels}
        />
      ) : null}

      {report ? (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-foreground text-lg font-semibold">AI portfolio report</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveReport(null);
                setReportId("");
              }}
            >
              Close report
            </Button>
          </div>
          <AIReportView report={report} />
        </section>
      ) : null}
      {!report && reportId && fetchedReport.isLoading ? <AnalyticsLoading rows={4} /> : null}
      {!report && reportId && fetchedReport.isError ? (
        <AnalyticsError error={fetchedReport.error} retry={() => void fetchedReport.refetch()} />
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <PortfolioStat label="Channels" value={formatCount(query.data.total_channels)} />
        <PortfolioStat label="Subscribers" value={formatCount(query.data.total_subscribers)} />
        <PortfolioStat label="Total views" value={formatCount(query.data.total_views)} />
        <PortfolioStat label="Videos" value={formatCount(query.data.total_videos)} />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No connected channels"
          description="Connect a YouTube channel to start comparing analytics."
          variant="lagoon"
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <h2 className="text-foreground font-semibold">Channel comparison</h2>
            <label className="text-muted-foreground flex items-center gap-2 text-sm">
              Sort by
              <select
                className="border-border-strong bg-background text-foreground h-9 rounded-xl border px-3"
                value={sort}
                onChange={(event) => setSort(event.target.value as SortField)}
              >
                <option value="views">Views</option>
                <option value="subscribers">Subscribers</option>
                <option value="recent_uploads_30d">Recent uploads</option>
                <option value="growth">28-day views</option>
                <option value="average_performance_index">Performance index</option>
              </select>
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse text-left text-sm">
              <thead className="bg-muted text-muted-foreground text-xs">
                <tr>
                  {[
                    "Channel",
                    "Subscribers",
                    "Views",
                    "Uploads (30 days)",
                    "28-day growth",
                    "Performance",
                    "Latest upload",
                    "Last sync",
                    "Status",
                  ].map((column) => (
                    <th key={column} className="px-4 py-3 font-medium">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((channel) => (
                  <tr
                    key={channel.account_id}
                    className="border-border hover:bg-muted/50 border-b last:border-0"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/accounts/${channel.account_id}`}
                        className="flex items-center gap-3"
                      >
                        <Avatar
                          src={channel.channel_thumbnail_url}
                          name={channel.channel_title}
                          size={38}
                        />
                        <span className="min-w-0">
                          <span className="text-foreground block truncate font-medium">
                            {channel.channel_title}
                          </span>
                          <span className="text-muted-foreground text-xs">{channel.nickname}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="text-body px-4 py-3">{formatCount(channel.subscribers)}</td>
                    <td className="text-body px-4 py-3">{formatCount(channel.total_views)}</td>
                    <td className="text-body px-4 py-3">
                      {formatCount(channel.recent_uploads_30d)}
                    </td>
                    <td className="text-body px-4 py-3">
                      {formatCount(channel.views_28d)} views ·{" "}
                      {formatCount(channel.subscribers_28d)} subs
                    </td>
                    <td className="text-body px-4 py-3">
                      {channel.average_performance_index == null
                        ? "—"
                        : `${channel.average_performance_index.toFixed(2)}x`}
                    </td>
                    <td className="text-body px-4 py-3">
                      {channel.top_video ? (
                        <a
                          href={`https://www.youtube.com/watch?v=${encodeURIComponent(channel.top_video.video_id)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-foreground block max-w-48 truncate hover:underline"
                        >
                          {channel.top_video.title}
                        </a>
                      ) : channel.last_published_at ? (
                        formatDate(channel.last_published_at)
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="text-body px-4 py-3">
                      {formatDateTime(channel.sync.last_synced_at)}
                    </td>
                    <td className="px-4 py-3">
                      <ChannelFlags channel={channel} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-foreground font-semibold">Saved portfolio reports</h2>
        {savedReports.isLoading ? (
          <AnalyticsLoading rows={2} />
        ) : savedReports.isError ? (
          <AnalyticsError error={savedReports.error} retry={() => void savedReports.refetch()} />
        ) : savedReports.data?.reports.length ? (
          <div className="flex flex-col gap-2">
            {savedReports.data.reports.map((saved) => (
              <Card
                key={saved.id}
                className="flex flex-wrap items-center justify-between gap-3 p-3.5"
              >
                <div className="min-w-0">
                  <p className="text-foreground truncate text-sm font-medium">{saved.headline}</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {formatDate(saved.created_at)}
                    {saved.score == null ? "" : ` · Score ${saved.score}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setActiveReport(null);
                      setReportId(saved.id);
                    }}
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="danger-outline"
                    disabled={deleteReport.isPending}
                    onClick={() => void removeReport(saved.id)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Saved portfolio reports will appear here.</p>
        )}
      </section>
    </div>
  );
}

function PortfolioStat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="text-foreground mt-2 text-2xl font-semibold">{value}</p>
    </Card>
  );
}

function ChannelFlags({
  channel,
}: {
  channel: {
    needs_reconnect: boolean;
    analytics_enabled: boolean;
    sync: { status: string; last_synced_at: string | null; is_stale: boolean };
  };
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {channel.needs_reconnect ? <Badge tone="warning">Reconnect</Badge> : null}
      {!channel.analytics_enabled && !channel.needs_reconnect ? (
        <Badge tone="warning">Analytics off</Badge>
      ) : null}
      {channel.sync.status === "running" ? <Badge tone="info">Syncing</Badge> : null}
      {channel.sync.status === "failed" ? <Badge tone="danger">Sync failed</Badge> : null}
      {channel.sync.is_stale && channel.sync.last_synced_at ? (
        <Badge tone="warning">Stale data</Badge>
      ) : null}
      {!channel.sync.last_synced_at && channel.sync.status !== "running" ? (
        <Badge tone="neutral">Not synced</Badge>
      ) : null}
      {!channel.needs_reconnect &&
      channel.analytics_enabled &&
      channel.sync.status !== "running" &&
      channel.sync.last_synced_at ? (
        <Badge tone="success">Ready</Badge>
      ) : null}
    </div>
  );
}

function PortfolioAIError({
  error,
  unavailable,
  retry,
  onSync,
  syncing,
}: {
  error: unknown;
  unavailable: boolean;
  retry: () => void;
  onSync: () => void;
  syncing: boolean;
}) {
  const apiError = toApiError(error);
  if (unavailable)
    return (
      <Alert tone="info" title="AI insights unavailable">
        AI insights are not available right now.
      </Alert>
    );
  if (apiError.code === "ai_limit_reached")
    return (
      <Alert tone="warning" title="AI report limit reached">
        {apiError.message}
      </Alert>
    );
  if (apiError.code === "youtube_quota_exceeded") {
    return (
      <Alert tone="warning" title="YouTube daily limit reached">
        The daily YouTube API limit of your Google project is used up. It resets at midnight Pacific
        Time. Stored data remains available.
      </Alert>
    );
  }
  if (
    apiError.code === "analytics_permission_missing" ||
    (apiError.code === "validation_error" &&
      `${apiError.message} ${apiError.details.map((item) => item.message).join(" ")}`
        .toLowerCase()
        .includes("reconnect"))
  ) {
    return (
      <Alert
        tone="warning"
        title="Reconnect channels to restore analytics access"
        action={
          <Button asChild size="sm" variant="outline">
            <Link href="/accounts">Connected accounts</Link>
          </Button>
        }
      >
        Reconnect channels that need analytics permission, then generate the report again.
      </Alert>
    );
  }
  if (apiError.code === "analytics_not_synced") {
    return (
      <Alert
        tone="warning"
        title="Load channel data first"
        action={
          <Button size="sm" loading={syncing} onClick={onSync}>
            Sync channels
          </Button>
        }
      >
        Sync connected channels, then try the portfolio report again.
      </Alert>
    );
  }
  return (
    <Alert
      tone="danger"
      title="Portfolio report could not be generated"
      action={
        apiError.code === "youtube_api_not_enabled" ? (
          <Button asChild size="sm" variant="outline">
            <Link href="/accounts?oauth=1">OAuth settings</Link>
          </Button>
        ) : [
            "ai_busy",
            "ai_blocked",
            "ai_generation_failed",
            "youtube_unavailable",
            "youtube_bad_request",
            "youtube_forbidden",
          ].includes(apiError.code) ? (
          <Button size="sm" variant="outline" onClick={retry}>
            Retry
          </Button>
        ) : undefined
      }
    >
      {apiError.code === "youtube_api_not_enabled"
        ? "The YouTube Data API or YouTube Analytics API is not enabled in your Google Cloud project. Enable both APIs, then update OAuth scopes and reconnect the channel."
        : apiError.message || getErrorMessage(error)}
    </Alert>
  );
}
