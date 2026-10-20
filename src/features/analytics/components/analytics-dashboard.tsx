"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { ConnectAccountDialog } from "@/features/accounts/components/connect-account-dialog";
import { OAuthSettingsDialog } from "@/features/accounts/components/oauth-settings-dialog";
import { useCredentials } from "@/features/accounts/hooks";
import { AIInsightsPanel } from "@/features/analytics/components/ai-insights-panel";
import {
  AnalyticsError,
  AnalyticsSection,
  AvailableNotice,
  formatCount,
  formatDuration,
  formatPercent,
  getCountryName,
  QueryContent,
  readableKey,
} from "@/features/analytics/components/analytics-primitives";
import {
  useAnalyticsAudience,
  useAnalyticsChannel,
  useAnalyticsContent,
  useAnalyticsPerformance,
  useAnalyticsPublishing,
  useAnalyticsSyncStatus,
  useAnalyticsTopVideos,
  useAnalyticsTraffic,
  useAnalyticsVideos,
  useBrowserTimezone,
  useStartAnalyticsSync,
} from "@/features/analytics/hooks";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getErrorMessage } from "@/lib/api/errors";
import { formatDate, formatDateTime } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import type { AnalyticsMetrics, AnalyticsRange, AnalyticsVideoSort } from "@/types/api";

const tabOptions = [
  "Overview",
  "Videos",
  "Audience",
  "Traffic and search",
  "Publishing",
  "Content patterns",
  "AI insights",
] as const;
type DashboardTab = (typeof tabOptions)[number];
const tabValues = [
  "overview",
  "videos",
  "audience",
  "traffic",
  "publishing",
  "content",
  "ai",
] as const;
const tabName = Object.fromEntries(
  tabValues.map((value, index) => [value, tabOptions[index]]),
) as Record<(typeof tabValues)[number], DashboardTab>;
const tabKey = Object.fromEntries(
  tabOptions.map((value, index) => [value, tabValues[index]]),
) as Record<DashboardTab, (typeof tabValues)[number]>;
const metricChoices = [
  { key: "views", label: "Views" },
  { key: "estimated_minutes_watched", label: "Watch time (minutes)" },
  { key: "likes", label: "Likes" },
  { key: "comments", label: "Comments" },
  { key: "subscribers_gained", label: "Subscribers gained" },
  { key: "subscribers_lost", label: "Subscribers lost" },
] as const;

const chartColor = "var(--primary)";
const chartColors = ["#2563eb", "#14b8a6", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

export function AnalyticsDashboard() {
  const params = useParams<{ accountId: string }>();
  const accountId = params.accountId;
  const router = useRouter();
  const searchParams = useSearchParams();
  const channel = useAnalyticsChannel(accountId);
  const sync = useAnalyticsSyncStatus(
    accountId,
    Boolean(channel.data && !channel.data.needs_reconnect),
  );
  const startSync = useStartAnalyticsSync(accountId);
  const queryClient = useQueryClient();
  const credentials = useCredentials();
  const [connectOpen, setConnectOpen] = React.useState(false);
  const [oauthOpen, setOauthOpen] = React.useState(false);
  const [pendingNickname, setPendingNickname] = React.useState<string | null>(null);
  const attemptedAutoSync = React.useRef<string | null>(null);
  const rawTab = searchParams.get("tab") ?? "overview";
  const activeTab = rawTab in tabName ? tabName[rawTab as keyof typeof tabName] : "Overview";
  const daysValue = Number(searchParams.get("days") ?? "28");
  const days = [7, 28, 90, 365].includes(daysValue) ? daysValue : 28;
  const startDate = searchParams.get("start_date") ?? "";
  const endDate = searchParams.get("end_date") ?? "";
  const range: AnalyticsRange =
    startDate && endDate
      ? { start_date: startDate, end_date: endDate }
      : days === 28
        ? {}
        : { days };

  React.useEffect(() => {
    if (!channel.data || channel.data.needs_reconnect || attemptedAutoSync.current === accountId)
      return;
    attemptedAutoSync.current = accountId;
    if (
      channel.data.sync.status !== "running" &&
      (!channel.data.has_data || channel.data.sync.is_stale)
    ) {
      startSync.mutate();
    }
  }, [accountId, channel.data, startSync]);

  const activeSync = sync.data ?? channel.data?.sync;
  const previousSyncStatus = React.useRef(activeSync?.status);
  React.useEffect(() => {
    if (activeSync?.status === "completed" && previousSyncStatus.current !== "completed") {
      void queryClient.invalidateQueries({ queryKey: queryKeys.analytics.account(accountId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.analytics.channel(accountId) });
      toast.success("Channel analytics synced.");
    }
    previousSyncStatus.current = activeSync?.status;
  }, [accountId, activeSync?.status, queryClient]);

  function updateQuery(next: {
    tab?: DashboardTab;
    days?: number;
    start_date?: string;
    end_date?: string;
  }) {
    const query = new URLSearchParams(searchParams.toString());
    if (next.tab) query.set("tab", tabKey[next.tab]);
    if (next.days) {
      query.set("days", String(next.days));
      query.delete("start_date");
      query.delete("end_date");
    }
    if (next.start_date !== undefined) query.set("start_date", next.start_date);
    if (next.end_date !== undefined) query.set("end_date", next.end_date);
    router.replace(`/accounts/${accountId}?${query.toString()}`, { scroll: false });
  }

  function openReconnect() {
    setConnectOpen(true);
  }

  function requireCredentials(nickname: string) {
    setPendingNickname(nickname);
    setConnectOpen(false);
    setOauthOpen(true);
  }

  function continueReconnect() {
    if (!pendingNickname) return;
    setPendingNickname(null);
    setConnectOpen(true);
  }

  if (channel.isLoading && !channel.data) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-32 rounded-3xl" />
        <Skeleton className="h-12 rounded-2xl" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }
  if (channel.isError && !channel.data) {
    return <AnalyticsError error={channel.error} retry={() => void channel.refetch()} />;
  }
  if (!channel.data) return <Skeleton className="h-32 rounded-3xl" />;
  const data = channel.data;
  if (!data.has_data && activeSync?.status === "running") {
    return (
      <div className="flex min-h-[65vh] flex-col items-center justify-center gap-4 text-center">
        <LoaderCircle className="text-primary size-10 animate-spin" aria-hidden />
        <div>
          <h1 className="text-foreground text-xl font-semibold">Loading your channel analytics</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {activeSync.videos_synced} videos synced. This may take a few minutes.
          </p>
        </div>
        <Button variant="outline" onClick={() => void sync.refetch()}>
          Refresh status
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {channel.isError ? (
        <AnalyticsError
          error={channel.error}
          retry={() => void channel.refetch()}
          onReconnect={openReconnect}
          onOAuthSettings={() => setOauthOpen(true)}
        />
      ) : null}
      <PageHeader
        title={data.channel_title}
        description={`${data.nickname}${data.google_email ? ` · ${data.google_email}` : ""}`}
        actions={
          <>
            <Button
              variant="outline"
              loading={startSync.isPending}
              disabled={data.needs_reconnect || activeSync?.status === "running"}
              onClick={() => startSync.mutate()}
            >
              Sync now
            </Button>
            <label className="text-body flex items-center gap-2 text-sm">
              Date range
              <select
                className="border-border-strong bg-background text-foreground h-10 rounded-full border px-3"
                value={startDate && endDate ? "custom" : String(days)}
                onChange={(event) => {
                  if (event.target.value !== "custom") {
                    updateQuery({ days: Number(event.target.value) });
                  } else {
                    const end = new Date();
                    const start = new Date();
                    start.setDate(end.getDate() - 27);
                    const asDate = (date: Date) =>
                      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                    updateQuery({ start_date: asDate(start), end_date: asDate(end) });
                  }
                }}
              >
                <option value="7">7 days</option>
                <option value="28">28 days</option>
                <option value="90">90 days</option>
                <option value="365">365 days</option>
                <option value="custom">Custom</option>
              </select>
            </label>
          </>
        }
      />

      <Card className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
        <Avatar src={data.channel_thumbnail_url} name={data.channel_title} size={56} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <a
              className="text-foreground font-semibold hover:underline"
              href={data.channel_url}
              target="_blank"
              rel="noreferrer"
            >
              {data.channel_title}
            </a>
            {data.hidden_subscriber_count ? (
              <Badge tone="neutral">Subscriber count hidden</Badge>
            ) : null}
            {data.analytics_enabled ? (
              <Badge tone="success">Analytics enabled</Badge>
            ) : (
              <Badge tone="warning">Analytics unavailable</Badge>
            )}
          </div>
          <div className="text-muted-foreground mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
            <span>
              {data.subscribers == null
                ? "Subscribers unavailable"
                : `${formatCount(data.subscribers)} subscribers`}
            </span>
            <span>{formatCount(data.total_views)} total views</span>
            <span>{formatCount(data.channel_video_count)} videos</span>
            <span>Last synced {formatDateTime(data.sync.last_synced_at)}</span>
          </div>
        </div>
      </Card>
      <Card className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
        <GrowthMetric label="Subscribers · 7 days" value={data.growth.subscribers_7d} />
        <GrowthMetric label="Subscribers · 28 days" value={data.growth.subscribers_28d} />
        <GrowthMetric label="Subscribers · 90 days" value={data.growth.subscribers_90d} />
        <GrowthMetric label="Views · 7 days" value={data.growth.views_7d} />
        <GrowthMetric label="Views · 28 days" value={data.growth.views_28d} />
        <GrowthMetric label="Views · 90 days" value={data.growth.views_90d} />
      </Card>

      {data.needs_reconnect ? (
        <Alert tone="warning" title="Reconnect this channel to continue">
          Analytics and sync are unavailable until this channel is reconnected.
          <Button className="ml-3" size="sm" variant="outline" onClick={openReconnect}>
            Reconnect
          </Button>
        </Alert>
      ) : null}
      {!data.analytics_enabled && !data.needs_reconnect ? (
        <Alert tone="warning" title="Analytics permission required">
          This channel was connected before analytics was available. Reconnect it to unlock watch
          time, audience and traffic data.
          <Button className="ml-3" size="sm" variant="outline" onClick={openReconnect}>
            Reconnect
          </Button>
        </Alert>
      ) : null}
      {activeSync?.status === "running" ? (
        <Alert tone="info" title="Syncing channel data">
          {data.has_data
            ? `Refreshing stored data. ${activeSync.videos_synced} videos synced so far.`
            : `Loading your channel for the first time. ${activeSync.videos_synced} videos synced so far.`}
        </Alert>
      ) : null}
      {activeSync?.status === "failed" ? (
        <Alert
          tone="danger"
          title="Channel sync failed"
          action={
            <Button size="sm" variant="outline" onClick={() => startSync.mutate()}>
              Retry
            </Button>
          }
        >
          {activeSync.error || "The channel data could not be synced."}
        </Alert>
      ) : null}
      {startSync.isError ? (
        <AnalyticsError
          error={startSync.error}
          retry={() => startSync.mutate()}
          onReconnect={openReconnect}
          onOAuthSettings={() => setOauthOpen(true)}
        />
      ) : null}

      <div className="border-border flex gap-1 overflow-x-auto border-b pb-1">
        {tabOptions.map((tab) => (
          <button
            key={tab}
            type="button"
            aria-current={activeTab === tab ? "page" : undefined}
            onClick={() => updateQuery({ tab })}
            className={`shrink-0 rounded-t-xl px-3 py-2.5 text-sm transition-colors ${
              activeTab === tab
                ? "border-primary text-foreground border-b-2 font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {range.start_date ? (
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-muted-foreground text-sm">
            From{" "}
            <input
              type="date"
              value={startDate}
              onChange={(event) => updateQuery({ start_date: event.target.value })}
              className="border-border-strong bg-background text-foreground rounded-lg border px-2 py-1"
            />
          </label>
          <label className="text-muted-foreground text-sm">
            To{" "}
            <input
              type="date"
              value={endDate}
              onChange={(event) => updateQuery({ end_date: event.target.value })}
              className="border-border-strong bg-background text-foreground rounded-lg border px-2 py-1"
            />
          </label>
          <Button size="sm" variant="ghost" onClick={() => updateQuery({ days: 28 })}>
            Clear custom range
          </Button>
        </div>
      ) : null}

      {activeTab === "Overview" ? (
        data.analytics_enabled ? (
          <OverviewTab
            accountId={accountId}
            range={range}
            onReconnect={openReconnect}
            onOAuthSettings={() => setOauthOpen(true)}
          />
        ) : (
          <AnalyticsUnavailable />
        )
      ) : null}
      {activeTab === "Videos" ? (
        <VideosTab accountId={accountId} onReconnect={openReconnect} />
      ) : null}
      {activeTab === "Audience" ? (
        data.analytics_enabled ? (
          <AudienceTab
            accountId={accountId}
            range={range}
            onReconnect={openReconnect}
            onOAuthSettings={() => setOauthOpen(true)}
          />
        ) : (
          <AnalyticsUnavailable />
        )
      ) : null}
      {activeTab === "Traffic and search" ? (
        data.analytics_enabled ? (
          <TrafficTab
            accountId={accountId}
            range={range}
            onReconnect={openReconnect}
            onOAuthSettings={() => setOauthOpen(true)}
          />
        ) : (
          <AnalyticsUnavailable />
        )
      ) : null}
      {activeTab === "Publishing" ? (
        <PublishingTab
          accountId={accountId}
          onReconnect={openReconnect}
          onOAuthSettings={() => setOauthOpen(true)}
        />
      ) : null}
      {activeTab === "Content patterns" ? (
        <ContentTab
          accountId={accountId}
          onReconnect={openReconnect}
          onOAuthSettings={() => setOauthOpen(true)}
        />
      ) : null}
      {activeTab === "AI insights" ? (
        <AIInsightsPanel
          accountId={accountId}
          onReconnect={openReconnect}
          onOAuthSettings={() => setOauthOpen(true)}
        />
      ) : null}

      <ConnectAccountDialog
        open={connectOpen}
        onOpenChange={setConnectOpen}
        initialNickname={data.nickname}
        reconnect
        credentialsConfigured={credentials.data?.configured}
        onCredentialsRequired={requireCredentials}
      />
      <OAuthSettingsDialog
        open={oauthOpen}
        onOpenChange={(open) => {
          setOauthOpen(open);
          if (!open) setPendingNickname(null);
        }}
        notice={
          pendingNickname
            ? "Save your Google credentials and then reconnect to grant analytics access."
            : undefined
        }
        onSaved={continueReconnect}
      />
    </div>
  );
}

function AnalyticsUnavailable() {
  return (
    <Alert tone="warning" title="Analytics permission required">
      Reconnect this channel to grant YouTube Analytics permission and access this section.
    </Alert>
  );
}

function GrowthMetric({ label, value }: { label: string; value: number | null }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-foreground mt-1 text-sm font-medium">
        {value === null ? "Not enough history yet" : formatCount(value)}
      </p>
    </div>
  );
}

function OverviewTab({
  accountId,
  range,
  onReconnect,
  onOAuthSettings,
}: {
  accountId: string;
  range: AnalyticsRange;
  onReconnect: () => void;
  onOAuthSettings: () => void;
}) {
  const performance = useAnalyticsPerformance(accountId, range);
  const topVideos = useAnalyticsTopVideos(accountId, { ...range, limit: 10 });
  const [metric, setMetric] = React.useState<(typeof metricChoices)[number]["key"]>("views");

  if (performance.isLoading && !performance.data) return <Skeleton className="h-96 rounded-3xl" />;
  if (performance.isError && !performance.data) {
    return (
      <AnalyticsError
        error={performance.error}
        retry={() => void performance.refetch()}
        onReconnect={onReconnect}
        onOAuthSettings={onOAuthSettings}
      />
    );
  }
  if (!performance.data) return <Skeleton className="h-96 rounded-3xl" />;
  const result = performance.data;
  const kpis: Array<{
    key: keyof AnalyticsMetrics;
    label: string;
    value: string;
    format: "count" | "duration" | "percent";
  }> = [
    { key: "views", label: "Views", value: formatCount(result.current.views), format: "count" },
    {
      key: "watch_time_hours",
      label: "Watch time",
      value: `${result.current.watch_time_hours.toFixed(1)} hrs`,
      format: "count",
    },
    {
      key: "average_view_duration_seconds",
      label: "Average view duration",
      value: formatDuration(result.current.average_view_duration_seconds),
      format: "duration",
    },
    {
      key: "average_view_percentage",
      label: "Average view percentage",
      value: formatPercent(result.current.average_view_percentage),
      format: "percent",
    },
    { key: "likes", label: "Likes", value: formatCount(result.current.likes), format: "count" },
    {
      key: "comments",
      label: "Comments",
      value: formatCount(result.current.comments),
      format: "count",
    },
    {
      key: "net_subscribers",
      label: "Net subscribers",
      value: formatCount(result.current.net_subscribers),
      format: "count",
    },
    {
      key: "engagement_rate",
      label: "Engagement rate",
      value: formatPercent(result.current.engagement_rate),
      format: "percent",
    },
  ];
  return (
    <div className="flex flex-col gap-4">
      {performance.isError ? (
        <AnalyticsError
          error={performance.error}
          retry={() => void performance.refetch()}
          onReconnect={onReconnect}
          onOAuthSettings={onOAuthSettings}
        />
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => {
          const change = result.change_percent[item.key];
          return (
            <Card key={item.key} className="p-4">
              <p className="text-muted-foreground text-sm">{item.label}</p>
              <p className="text-foreground mt-2 text-2xl font-semibold">{item.value}</p>
              <p
                className={`mt-1 text-xs ${change === null ? "text-muted-foreground" : change >= 0 ? "text-success" : "text-danger"}`}
              >
                {change === null
                  ? "No comparison yet"
                  : `${change >= 0 ? "+" : ""}${change.toFixed(1)}% vs previous period`}
              </p>
            </Card>
          );
        })}
      </div>
      <AnalyticsSection
        title="Performance over time"
        description={`${formatDate(result.start_date)} – ${formatDate(result.end_date)}`}
        action={
          <select
            aria-label="Chart metric"
            className="border-border-strong bg-background text-foreground h-9 rounded-xl border px-3 text-sm"
            value={metric}
            onChange={(event) =>
              setMetric(event.target.value as (typeof metricChoices)[number]["key"])
            }
          >
            {metricChoices.map((choice) => (
              <option key={choice.key} value={choice.key}>
                {choice.label}
              </option>
            ))}
          </select>
        }
      >
        {result.daily.length === 0 ? (
          <p className="text-muted-foreground py-10 text-center text-sm">
            No daily data for this range.
          </p>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={result.daily}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date: string) => date.slice(5)} />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey={metric}
                  stroke={chartColor}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        <p className="text-muted-foreground mt-2 text-xs">
          YouTube analytics is about 2 days behind.
        </p>
      </AnalyticsSection>
      <AnalyticsSection title="Top videos in this period">
        <QueryContent
          query={topVideos}
          empty={(topVideos.data?.videos.length ?? 0) === 0}
          onReconnect={onReconnect}
          onOAuthSettings={onOAuthSettings}
        >
          {(response) => (
            <div className="flex flex-col gap-2">
              {response.videos.map((video) => (
                <Link
                  key={video.video_id}
                  href={`/accounts/${accountId}/videos/${video.video_id}`}
                  className="hover:bg-muted flex items-center gap-3 rounded-xl p-2.5"
                >
                  <img
                    src={video.thumbnail_url ?? ""}
                    alt=""
                    className="bg-muted aspect-video w-24 rounded-lg object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="text-foreground block truncate text-sm font-medium">
                      {video.title}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {formatCount(video.views)} views · {formatCount(video.likes)} likes
                    </span>
                  </span>
                  {video.is_short ? <Badge tone="info">Short</Badge> : null}
                </Link>
              ))}
            </div>
          )}
        </QueryContent>
      </AnalyticsSection>
    </div>
  );
}

function VideosTab({ accountId, onReconnect }: { accountId: string; onReconnect: () => void }) {
  const [search, setSearch] = React.useState("");
  const [contentType, setContentType] = React.useState<"all" | "short" | "long">("all");
  const [privacyStatus, setPrivacyStatus] = React.useState<"" | "public" | "unlisted" | "private">(
    "",
  );
  const [sort, setSort] = React.useState<AnalyticsVideoSort>("published_at");
  const [order, setOrder] = React.useState<"asc" | "desc">("desc");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const [offset, setOffset] = React.useState(0);
  const debouncedSearch = useDebouncedValue(search);
  const limit = 20;
  const query = useAnalyticsVideos(accountId, {
    search: debouncedSearch || undefined,
    content_type: contentType,
    privacy_status: privacyStatus || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    sort,
    order,
    limit,
    offset,
  });
  return (
    <AnalyticsSection
      title="Channel videos"
      description="Search, filter and sort your stored video library."
    >
      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setOffset(0);
          }}
          placeholder="Search videos"
          className="border-border-strong bg-background text-foreground h-10 rounded-xl border px-3 text-sm"
        />
        <select
          aria-label="Content type"
          value={contentType}
          onChange={(event) => {
            setContentType(event.target.value as typeof contentType);
            setOffset(0);
          }}
          className="border-border-strong bg-background text-foreground h-10 rounded-xl border px-3 text-sm"
        >
          <option value="all">All content types</option>
          <option value="short">Shorts</option>
          <option value="long">Long-form videos</option>
        </select>
        <select
          aria-label="Privacy status"
          value={privacyStatus}
          onChange={(event) => {
            setPrivacyStatus(event.target.value as typeof privacyStatus);
            setOffset(0);
          }}
          className="border-border-strong bg-background text-foreground h-10 rounded-xl border px-3 text-sm"
        >
          <option value="">All privacy statuses</option>
          <option value="public">Public</option>
          <option value="unlisted">Unlisted</option>
          <option value="private">Private</option>
        </select>
        <label className="text-muted-foreground flex items-center gap-2 text-xs">
          From{" "}
          <input
            type="date"
            value={dateFrom}
            onChange={(event) => {
              setDateFrom(event.target.value);
              setOffset(0);
            }}
            className="border-border-strong bg-background text-foreground h-10 min-w-0 flex-1 rounded-xl border px-2 text-sm"
          />
        </label>
        <label className="text-muted-foreground flex items-center gap-2 text-xs">
          To{" "}
          <input
            type="date"
            value={dateTo}
            onChange={(event) => {
              setDateTo(event.target.value);
              setOffset(0);
            }}
            className="border-border-strong bg-background text-foreground h-10 min-w-0 flex-1 rounded-xl border px-2 text-sm"
          />
        </label>
        <div className="flex gap-2">
          <select
            aria-label="Sort videos"
            value={sort}
            onChange={(event) => setSort(event.target.value as AnalyticsVideoSort)}
            className="border-border-strong bg-background text-foreground h-10 min-w-0 flex-1 rounded-xl border px-3 text-sm"
          >
            <option value="published_at">Publish date</option>
            <option value="views">Views</option>
            <option value="likes">Likes</option>
            <option value="comments">Comments</option>
            <option value="engagement">Engagement</option>
            <option value="performance">Performance</option>
            <option value="duration">Duration</option>
          </select>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
          >
            {order === "asc" ? "Ascending" : "Descending"}
          </Button>
        </div>
      </div>
      {query.isLoading && !query.data ? (
        <AnalyticsVideoSkeleton />
      ) : query.isError && !query.data ? (
        <AnalyticsError
          error={query.error}
          retry={() => void query.refetch()}
          onReconnect={onReconnect}
        />
      ) : query.data?.videos.length ? (
        <>
          {query.isError ? (
            <AnalyticsError
              error={query.error}
              retry={() => void query.refetch()}
              onReconnect={onReconnect}
            />
          ) : null}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead className="text-muted-foreground border-border border-b text-xs">
                <tr>
                  {[
                    "Video",
                    "Published",
                    "Duration",
                    "Privacy",
                    "Views",
                    "Likes",
                    "Comments",
                    "Engagement",
                    "Performance",
                  ].map((heading) => (
                    <th key={heading} className="px-3 py-3 font-medium">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {query.data.videos.map((video) => {
                  const performance =
                    video.performance_index === null
                      ? "Too new"
                      : video.performance_index >= 1.5
                        ? "Outperforming"
                        : video.performance_index <= 0.7
                          ? "Underperforming"
                          : "Typical";
                  return (
                    <tr key={video.video_id} className="border-border hover:bg-muted/50 border-b">
                      <td className="px-3 py-3">
                        <Link
                          href={`/accounts/${accountId}/videos/${video.video_id}`}
                          className="flex max-w-xs items-center gap-3"
                        >
                          <img
                            src={video.thumbnail_url ?? ""}
                            alt=""
                            className="bg-muted aspect-video w-20 rounded-lg object-cover"
                          />
                          <span className="min-w-0">
                            <span className="text-foreground line-clamp-2 font-medium">
                              {video.title}
                            </span>
                            {video.is_short ? (
                              <Badge className="mt-1" tone="info">
                                Short
                              </Badge>
                            ) : null}
                          </span>
                        </Link>
                      </td>
                      <td className="text-body px-3 py-3">{formatDate(video.published_at)}</td>
                      <td className="text-body px-3 py-3">
                        {formatDuration(video.duration_seconds)}
                      </td>
                      <td className="text-body px-3 py-3 capitalize">{video.privacy_status}</td>
                      <td className="text-body px-3 py-3">{formatCount(video.view_count)}</td>
                      <td className="text-body px-3 py-3">{formatCount(video.like_count)}</td>
                      <td className="text-body px-3 py-3">{formatCount(video.comment_count)}</td>
                      <td className="text-body px-3 py-3">
                        {formatPercent(video.engagement_rate)}
                      </td>
                      <td className="px-3 py-3">
                        <PerformanceBadge label={performance} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Pagination
              total={query.data.total}
              limit={limit}
              offset={offset}
              onChange={setOffset}
              loading={query.isFetching}
            />
          </div>
        </>
      ) : (
        <>
          {query.isError ? (
            <AnalyticsError
              error={query.error}
              retry={() => void query.refetch()}
              onReconnect={onReconnect}
            />
          ) : null}
          <p className="text-muted-foreground py-10 text-center text-sm">
            No videos match these filters.
          </p>
        </>
      )}
    </AnalyticsSection>
  );
}

function AnalyticsVideoSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[0, 1, 2, 3].map((item) => (
        <Skeleton key={item} className="h-16 rounded-xl" />
      ))}
    </div>
  );
}

function PerformanceBadge({ label }: { label: string }) {
  const tone =
    label === "Outperforming" ? "success" : label === "Underperforming" ? "warning" : "neutral";
  return <Badge tone={tone}>{label}</Badge>;
}

function AudienceTab({
  accountId,
  range,
  onReconnect,
  onOAuthSettings,
}: {
  accountId: string;
  range: AnalyticsRange;
  onReconnect: () => void;
  onOAuthSettings: () => void;
}) {
  const query = useAnalyticsAudience(accountId, range);
  return (
    <QueryContent
      query={query}
      empty={false}
      onReconnect={onReconnect}
      onOAuthSettings={onOAuthSettings}
    >
      {(data) => (
        <div className="grid gap-4 xl:grid-cols-2">
          <AnalyticsSection title="Age and gender">
            <AvailableNotice section={data.demographics} />
            {data.demographics.available && data.demographics.rows.length ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.demographics.rows}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="age_group" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="viewer_percentage" fill={chartColor} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : data.demographics.available ? (
              <p className="text-muted-foreground mt-4 text-sm">
                {data.demographics.message || "Not enough data yet."}
              </p>
            ) : null}
          </AnalyticsSection>
          <AnalyticsSection title="Top countries">
            <AvailableNotice section={data.countries} />
            {data.countries.available ? (
              <div className="flex flex-col gap-2">
                {data.countries.rows.length ? (
                  data.countries.rows.slice(0, 12).map((row) => (
                    <div key={row.country} className="flex items-center gap-3 text-sm">
                      <span className="text-foreground w-32 truncate">
                        {getCountryName(row.country)}
                      </span>
                      <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                        <div
                          className="bg-primary h-full rounded-full"
                          style={{ width: `${Math.min(100, row.share_percent)}%` }}
                        />
                      </div>
                      <span className="text-muted-foreground w-24 text-right">
                        {formatPercent(row.share_percent)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">
                    {data.countries.message || "Not enough data yet."}
                  </p>
                )}
              </div>
            ) : null}
          </AnalyticsSection>
          <DistributionSection title="Devices" section={data.devices} />
          <DistributionSection title="Subscribed status" section={data.subscribed_status} />
        </div>
      )}
    </QueryContent>
  );
}

function DistributionSection({
  title,
  section,
}: {
  title: string;
  section: {
    available: boolean;
    message: string | null;
    rows: Array<{ key: string; share_percent: number }>;
  };
}) {
  return (
    <AnalyticsSection title={title}>
      <AvailableNotice section={section} />
      {section.available && section.rows.length ? (
        <div className="grid gap-4 sm:grid-cols-[180px_1fr] sm:items-center">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={section.rows} dataKey="share_percent" nameKey="key" outerRadius={78}>
                  {section.rows.map((row, index) => (
                    <Cell key={row.key} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2">
            {section.rows.map((row, index) => (
              <div key={row.key} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-body flex items-center gap-2">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: chartColors[index % chartColors.length] }}
                  />
                  {readableKey(row.key)}
                </span>
                <span className="text-foreground font-medium">
                  {formatPercent(row.share_percent)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : section.available ? (
        <p className="text-muted-foreground mt-4 text-sm">
          {section.message || "Not enough data yet."}
        </p>
      ) : null}
    </AnalyticsSection>
  );
}

function TrafficTab({
  accountId,
  range,
  onReconnect,
  onOAuthSettings,
}: {
  accountId: string;
  range: AnalyticsRange;
  onReconnect: () => void;
  onOAuthSettings: () => void;
}) {
  const query = useAnalyticsTraffic(accountId, range);
  return (
    <QueryContent
      query={query}
      empty={false}
      onReconnect={onReconnect}
      onOAuthSettings={onOAuthSettings}
    >
      {(data) => (
        <div className="flex flex-col gap-4">
          <TrafficRows title="Traffic sources" section={data.sources} chart />
          <AnalyticsSection
            title="YouTube search terms"
            description="Search terms can help shape future titles and tags."
          >
            <AvailableNotice section={data.search_terms} />
            {data.search_terms.available ? (
              <AnalyticsRows
                rows={data.search_terms.rows}
                emptyMessage={data.search_terms.message || "No search terms available yet."}
              />
            ) : null}
          </AnalyticsSection>
          <TrafficRows title="Views by content type" section={data.content_types} />
        </div>
      )}
    </QueryContent>
  );
}

function TrafficRows({
  title,
  section,
  chart,
}: {
  title: string;
  section: {
    available: boolean;
    message: string | null;
    rows: Array<{
      key: string;
      views: number;
      estimated_minutes_watched: number;
      share_percent: number;
    }>;
  };
  chart?: boolean;
}) {
  return (
    <AnalyticsSection title={title}>
      <AvailableNotice section={section} />
      {section.available ? (
        chart ? (
          section.rows.length ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={section.rows.map((row) => ({ ...row, label: readableKey(row.key) }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="views" fill={chartColor} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              {section.message || "No traffic data yet."}
            </p>
          )
        ) : (
          <AnalyticsRows
            rows={section.rows.map((row) => ({
              label: readableKey(row.key),
              views: row.views,
              share_percent: row.share_percent,
            }))}
            emptyMessage={section.message || "No content type data yet."}
          />
        )
      ) : null}
    </AnalyticsSection>
  );
}

function AnalyticsRows({
  rows,
  emptyMessage,
}: {
  rows: Array<{ key?: string; label?: string; views?: number; share_percent?: number }>;
  emptyMessage: string;
}) {
  if (!rows.length) return <p className="text-muted-foreground text-sm">{emptyMessage}</p>;
  return (
    <div className="flex flex-col gap-2">
      {rows.map((row, index) => (
        <div
          key={`${row.key ?? row.label}-${index}`}
          className="border-border flex items-center justify-between gap-3 border-b py-2 text-sm last:border-0"
        >
          <span className="text-body truncate">{row.key ?? row.label}</span>
          <span className="text-muted-foreground shrink-0">
            {formatCount(row.views)} views · {formatPercent(row.share_percent)}
          </span>
        </div>
      ))}
    </div>
  );
}

function PublishingTab({
  accountId,
  onReconnect,
  onOAuthSettings,
}: {
  accountId: string;
  onReconnect: () => void;
  onOAuthSettings: () => void;
}) {
  const browserTimezone = useBrowserTimezone();
  const [timezone, setTimezone] = React.useState<string | null>(null);
  const selectedTimezone = timezone ?? browserTimezone;
  const [contentType, setContentType] = React.useState("all");
  const query = useAnalyticsPublishing(accountId, {
    timezone: selectedTimezone,
    content_type: contentType,
  });
  return (
    <QueryContent
      query={query}
      empty={false}
      onReconnect={onReconnect}
      onOAuthSettings={onOAuthSettings}
    >
      {(data) => (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <select
                value={contentType}
                onChange={(event) => setContentType(event.target.value)}
                className="border-border-strong bg-background text-foreground h-9 rounded-xl border px-3 text-sm"
              >
                <option value="all">All content</option>
                <option value="short">Shorts</option>
                <option value="long">Long-form</option>
              </select>
              <select
                value={selectedTimezone}
                onChange={(event) => setTimezone(event.target.value)}
                aria-label="Timezone"
                className="border-border-strong bg-background text-foreground h-9 rounded-xl border px-3 text-sm"
              >
                <option value={selectedTimezone}>{selectedTimezone}</option>
                <option value="Asia/Kolkata">Asia/Kolkata</option>
                <option value="UTC">UTC</option>
                <option value="America/Los_Angeles">America/Los_Angeles</option>
                <option value="Europe/London">Europe/London</option>
              </select>
            </div>
            <Badge
              tone={
                data.confidence === "high"
                  ? "success"
                  : data.confidence === "medium"
                    ? "info"
                    : "warning"
              }
            >
              Confidence: {data.confidence} · {data.sample_size} videos
            </Badge>
          </div>
          <Card className="bg-muted/60 p-5">
            <p className="text-foreground text-lg font-semibold">
              {data.best_weekday && data.best_hour !== null
                ? `Best day: ${data.best_weekday}, best time: ${String(data.best_hour).padStart(2, "0")}:00`
                : "Not enough upload history to recommend a time"}
            </p>
            {data.confidence === "none" || data.confidence === "low" ? (
              <p className="text-body mt-2 text-sm">
                {data.note || "Recommendations may change as more videos are published."}
              </p>
            ) : null}
            <p
              className="text-muted-foreground mt-2 text-xs"
              title="A performance index of 1.0 means typical for this channel."
            >
              A performance index of 1.0 is typical for this channel.
            </p>
          </Card>
          <AnalyticsSection title="Weekday and hour">
            {data.heatmap.length ? (
              <div className="overflow-x-auto">
                <div className="grid min-w-[680px] grid-cols-[72px_repeat(24,minmax(16px,1fr))] gap-1 text-[10px]">
                  <span />
                  {Array.from({ length: 24 }, (_, hour) => (
                    <span key={hour} className="text-muted-foreground text-center">
                      {hour}
                    </span>
                  ))}
                  {Array.from({ length: 7 }, (_, day) => (
                    <React.Fragment key={day}>
                      <span className="text-muted-foreground flex items-center">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day]}
                      </span>
                      {Array.from({ length: 24 }, (_, hour) => {
                        const cell = data.heatmap.find(
                          (row) => row.weekday === day && row.hour === hour,
                        );
                        const value = cell?.median_performance_index ?? 0;
                        return (
                          <span
                            key={hour}
                            title={`${hour}:00 · ${cell?.videos ?? 0} videos · index ${value.toFixed(2)}`}
                            className="aspect-square rounded-sm"
                            style={{
                              backgroundColor: cell
                                ? `color-mix(in srgb, var(--primary) ${Math.max(8, Math.min(100, value * 50))}%, transparent)`
                                : "var(--muted)",
                            }}
                          />
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">{data.note || "No upload data yet."}</p>
            )}
          </AnalyticsSection>
          <div className="grid gap-4 lg:grid-cols-2">
            <PublishingBar
              title="Performance by weekday"
              data={data.by_weekday.map((row) => ({
                label: row.label,
                index: row.median_performance_index,
              }))}
            />
            <PublishingBar
              title="Performance by hour"
              data={data.by_hour.map((row) => ({
                label: `${row.hour}:00`,
                index: row.median_performance_index,
              }))}
            />
            <PublishingBar
              title="Uploads per month"
              data={data.cadence.uploads_per_month.map((row) => ({
                label: row.month,
                index: row.videos,
              }))}
              metric="uploads"
            />
            <AnalyticsSection title="Upload cadence">
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <Metric label="Total videos" value={formatCount(data.cadence.total_videos)} />
                <Metric
                  label="Last 30 days"
                  value={formatCount(data.cadence.uploads_last_30_days)}
                />
                <Metric
                  label="Previous 30 days"
                  value={formatCount(data.cadence.uploads_previous_30_days)}
                />
                <Metric
                  label="Days since upload"
                  value={formatCount(data.cadence.days_since_last_upload)}
                />
                <Metric
                  label="Median gap"
                  value={
                    data.cadence.median_days_between_uploads == null
                      ? "—"
                      : `${data.cadence.median_days_between_uploads.toFixed(1)} days`
                  }
                />
              </dl>
            </AnalyticsSection>
          </div>
        </div>
      )}
    </QueryContent>
  );
}

function PublishingBar({
  title,
  data,
  metric = "index",
}: {
  title: string;
  data: Array<{ label: string; index: number }>;
  metric?: string;
}) {
  return (
    <AnalyticsSection title={title}>
      {data.length ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="index"
                name={metric === "uploads" ? "Videos" : "Performance index"}
                fill={chartColor}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">Not enough data yet.</p>
      )}
    </AnalyticsSection>
  );
}

function ContentTab({
  accountId,
  onReconnect,
  onOAuthSettings,
}: {
  accountId: string;
  onReconnect: () => void;
  onOAuthSettings: () => void;
}) {
  const [contentType, setContentType] = React.useState("all");
  const query = useAnalyticsContent(accountId, { content_type: contentType });
  async function copyTags(tags: string[]) {
    try {
      await navigator.clipboard.writeText(tags.join(", "));
      toast.success("Tags copied.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not copy tags."));
    }
  }
  return (
    <QueryContent
      query={query}
      empty={false}
      onReconnect={onReconnect}
      onOAuthSettings={onOAuthSettings}
    >
      {(data) => (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-muted-foreground text-sm">
              Analysis based on {data.sample_size} videos · {data.confidence} confidence
            </p>
            <select
              value={contentType}
              onChange={(event) => setContentType(event.target.value)}
              className="border-border-strong bg-background text-foreground h-9 rounded-xl border px-3 text-sm"
            >
              <option value="all">All content</option>
              <option value="short">Shorts</option>
              <option value="long">Long-form</option>
            </select>
          </div>
          {data.note ? <Alert tone="info">{data.note}</Alert> : null}
          <div className="grid gap-4 lg:grid-cols-2">
            <VideoInsightList title="Best videos" videos={data.best_videos} />
            <VideoInsightList title="Weakest videos" videos={data.worst_videos} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <AnalyticsSection
              title="Best tags"
              action={
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyTags(data.tags.top_tags.map((item) => item.tag))}
                >
                  Copy best tags
                </Button>
              }
            >
              <TagTable
                rows={data.tags.top_tags}
                emptyMessage={data.tags.note || "No tag data yet."}
              />
            </AnalyticsSection>
            <AnalyticsSection title="Weak tags">
              <TagTable
                rows={data.tags.weak_tags}
                emptyMessage={data.tags.note || "No tag data yet."}
              />
            </AnalyticsSection>
            <AnalyticsSection title="Most used tags">
              <TagTable
                rows={data.tags.most_used_tags}
                emptyMessage={data.tags.note || "No tag data yet."}
              />
            </AnalyticsSection>
            <AnalyticsSection title="Tag count patterns">
              <ContentChart
                data={data.tags.tag_count_groups.map((row) => ({
                  label: row.label,
                  value: row.median_performance_index,
                }))}
              />
            </AnalyticsSection>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <AnalyticsSection title="Title patterns">
              <ContentChart
                data={data.titles.length_groups.map((row) => ({
                  label: row.label,
                  value: row.median_performance_index,
                }))}
              />
              <div className="mt-4 flex flex-col gap-2">
                {data.titles.features.map((feature) => (
                  <div
                    key={feature.feature}
                    className="border-border flex justify-between gap-4 border-b py-2 text-sm"
                  >
                    <span>{titleFeature(feature.feature)}</span>
                    <span className="text-muted-foreground">
                      {feature.lift > 1
                        ? `${feature.lift.toFixed(2)} times better`
                        : feature.lift > 0
                          ? `${(1 / feature.lift).toFixed(2)} times worse`
                          : "No measurable lift"}
                    </span>
                  </div>
                ))}
              </div>
            </AnalyticsSection>
            <AnalyticsSection title="Video duration patterns">
              <ContentChart
                data={data.durations.map((row) => ({
                  label: row.label,
                  value: row.median_performance_index,
                }))}
              />
            </AnalyticsSection>
          </div>
        </div>
      )}
    </QueryContent>
  );
}

function VideoInsightList({
  title,
  videos,
}: {
  title: string;
  videos: Array<{
    video_id: string;
    title: string;
    published_at: string | null;
    views: number;
    performance_index: number | null;
  }>;
}) {
  return (
    <AnalyticsSection title={title}>
      {videos.length ? (
        <div className="flex flex-col gap-2">
          {videos.slice(0, 10).map((video) => (
            <div
              key={video.video_id}
              className="bg-muted/50 flex items-center justify-between gap-3 rounded-xl p-3"
            >
              <span className="min-w-0">
                <span className="text-foreground block truncate text-sm font-medium">
                  {video.title}
                </span>
                <span className="text-muted-foreground text-xs">
                  {formatDate(video.published_at)} · {formatCount(video.views)} views
                </span>
              </span>
              <Badge tone="neutral">{video.performance_index?.toFixed(2) ?? "—"}</Badge>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">Not enough data yet.</p>
      )}
    </AnalyticsSection>
  );
}

function TagTable({
  rows,
  emptyMessage,
}: {
  rows: Array<{
    tag: string;
    videos: number;
    median_performance_index: number | null;
    average_views: number;
  }>;
  emptyMessage: string;
}) {
  return rows.length ? (
    <div className="flex flex-col gap-2">
      {rows.slice(0, 10).map((row) => (
        <div key={row.tag} className="flex justify-between gap-3 text-sm">
          <span className="text-body truncate">{row.tag}</span>
          <span className="text-muted-foreground shrink-0">
            {row.videos} videos ·{" "}
            {row.median_performance_index == null
              ? "—"
              : `${row.median_performance_index.toFixed(2)} index`}
          </span>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-muted-foreground text-sm">{emptyMessage}</p>
  );
}

function ContentChart({ data }: { data: Array<{ label: string; value: number }> }) {
  if (!data.length) return <p className="text-muted-foreground text-sm">Not enough data yet.</p>;
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" name="Median performance index" fill={chartColor} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function titleFeature(key: string): string {
  const labels: Record<string, string> = {
    has_number: "Includes a number",
    has_question_mark: "Has a question mark",
    has_brackets: "Uses brackets",
    has_emoji: "Includes emoji",
    has_all_caps_word: "Has an all-caps word",
    has_separator: "Uses a separator",
    has_hashtag: "Includes a hashtag",
  };
  return labels[key] ?? readableKey(key);
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-foreground mt-1 font-medium">{value}</dd>
    </div>
  );
}
