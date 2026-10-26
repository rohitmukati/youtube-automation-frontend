"use client";

import * as React from "react";
import Link from "next/link";
import { Eye, Gauge, TrendingUp, Upload } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { EmptyState } from "@/components/shared/empty-state";
import { AnalyticsSection } from "@/features/analytics/components/analytics-primitives";
import type { AnalyticsOverview } from "@/types/api";

type Channel = AnalyticsOverview["channels"][number];

interface Row {
  id: string;
  label: string;
  title: string;
  color: string;
  avatar: string | null;
  views: number;
  subscribers: number | null;
  views28: number | null;
  subs28: number | null;
  uploads: number;
  performance: number | null;
  topVideo: Channel["top_video"];
  synced: boolean;
}

type MetricKey = "views" | "subscribers" | "views28" | "uploads" | "performance";

const PALETTE = [
  "#3b6cff",
  "#8b5cf6",
  "#ff7a45",
  "#14b8a6",
  "#f59e0b",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
  "#ef4444",
  "#64748b",
  "#a855f7",
];
const GRADIENT_FROM = "#3b6cff";
const GRADIENT_TO = "#8b5cf6";

const compactFormat = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const fullFormat = new Intl.NumberFormat();
const fmtCompact = (value: number) => compactFormat.format(value);
const fmtFull = (value: number) => fullFormat.format(value);
const fmtIndex = (value: number) => `${value.toFixed(2)}x`;
const fmtSigned = (value: number) => `${value > 0 ? "+" : ""}${fullFormat.format(value)}`;

const METRICS: Record<
  MetricKey,
  { label: string; read: (row: Row) => number | null; format: (value: number) => string }
> = {
  views: { label: "Views", read: (row) => row.views, format: fmtFull },
  subscribers: { label: "Subscribers", read: (row) => row.subscribers, format: fmtFull },
  views28: { label: "28-day views", read: (row) => row.views28, format: fmtFull },
  uploads: { label: "Uploads (30d)", read: (row) => row.uploads, format: fmtFull },
  performance: { label: "Performance", read: (row) => row.performance, format: fmtIndex },
};

const AXIS_TICK = { fontSize: 11, fill: "var(--muted-foreground)" };
const TOOLTIP_STYLE: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--card)",
  color: "var(--foreground)",
  fontSize: 12,
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.10)",
};

function buildRows(channels: Channel[]): Row[] {
  const titleCount = new Map<string, number>();
  for (const channel of channels) {
    titleCount.set(channel.channel_title, (titleCount.get(channel.channel_title) ?? 0) + 1);
  }
  return channels.map((channel, index) => ({
    id: channel.account_id,
    // Same title wali channels ko alag dikhane ke liye nickname jodte hain.
    label:
      (titleCount.get(channel.channel_title) ?? 0) > 1
        ? `${channel.channel_title} (${channel.nickname})`
        : channel.channel_title,
    title: channel.channel_title,
    color: PALETTE[index % PALETTE.length],
    avatar: channel.channel_thumbnail_url,
    views: channel.total_views,
    subscribers: channel.subscribers,
    views28: channel.views_28d,
    subs28: channel.subscribers_28d,
    uploads: channel.recent_uploads_30d,
    performance: channel.average_performance_index,
    topVideo: channel.top_video,
    synced: Boolean(channel.sync.last_synced_at),
  }));
}

function topN(rows: Row[], read: (row: Row) => number | null, limit = 8) {
  return rows
    .map((row) => ({ label: row.label, value: read(row) }))
    .filter((item): item is { label: string; value: number } => item.value != null)
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

function shorten(value: string) {
  return value.length > 10 ? `${value.slice(0, 9)}…` : value;
}

export function PortfolioVisuals({
  channels,
  onSync,
  syncing,
}: {
  channels: Channel[];
  onSync: () => void;
  syncing: boolean;
}) {
  const rows = React.useMemo(() => buildRows(channels), [channels]);
  const synced = React.useMemo(() => rows.filter((row) => row.synced), [rows]);
  const hidden = rows.length - synced.length;

  if (synced.length === 0) {
    return (
      <EmptyState
        title="No synced channels yet"
        description="Sync your channels once and the visual comparison will appear here."
        variant="lagoon"
        action={
          <Button loading={syncing} onClick={onSync}>
            Sync channels
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {hidden > 0 ? (
        <p className="text-muted-foreground text-sm">
          Showing {synced.length} synced {synced.length === 1 ? "channel" : "channels"}. {hidden}{" "}
          not synced yet {hidden === 1 ? "channel is" : "channels are"} left out of the charts.
        </p>
      ) : null}

      <Highlights rows={synced} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <RankingCard rows={synced} />
        <ShareCard rows={synced} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ColumnCard
          title="28-day views"
          description="Views gained by each channel in the last 28 days."
          name="28-day views"
          data={topN(synced, (row) => row.views28)}
          format={fmtFull}
        />
        <ColumnCard
          title="28-day subscriber change"
          description="Net subscribers gained or lost in the last 28 days."
          name="Net subscribers"
          data={topN(synced, (row) => row.subs28)}
          format={fmtSigned}
          colorFor={(value) => (value >= 0 ? "#16a34a" : "#ef4444")}
        />
        <ColumnCard
          title="Performance index"
          description="Average video performance. 1.00x is the typical level."
          name="Performance"
          data={topN(synced, (row) => row.performance)}
          format={fmtIndex}
          colorFor={(value) => (value >= 1 ? "#3b6cff" : "#f59e0b")}
          referenceValue={1}
        />
        <ColumnCard
          title="Upload activity"
          description="Videos published in the last 30 days."
          name="Uploads"
          data={topN(synced, (row) => row.uploads)}
          format={fmtFull}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <TopVideosCard rows={synced} />
        <HealthCard channels={channels} />
      </div>
    </div>
  );
}

/* ---------- Highlights ---------- */

function Highlights({ rows }: { rows: Row[] }) {
  const items: Array<{ title: string; icon: React.ReactNode; metric: MetricKey; tint: string }> = [
    { title: "Most views", icon: <Eye />, metric: "views", tint: "#3b6cff" },
    { title: "Fastest growing", icon: <TrendingUp />, metric: "views28", tint: "#16a34a" },
    { title: "Best performance", icon: <Gauge />, metric: "performance", tint: "#8b5cf6" },
    { title: "Most active", icon: <Upload />, metric: "uploads", tint: "#ff7a45" },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const def = METRICS[item.metric];
        let best: { row: Row; value: number } | null = null;
        for (const row of rows) {
          const value = def.read(row);
          if (value != null && value > 0 && (!best || value > best.value)) best = { row, value };
        }
        return (
          <Card key={item.title} className="p-4">
            <div className="flex items-center gap-2.5">
              <span
                className="grid size-8 place-items-center rounded-full [&_svg]:size-4"
                style={{
                  color: item.tint,
                  background: `color-mix(in srgb, ${item.tint} 14%, transparent)`,
                }}
              >
                {item.icon}
              </span>
              <p className="text-muted-foreground text-sm">{item.title}</p>
            </div>
            <p className="text-foreground mt-3 text-2xl font-semibold tracking-tight">
              {best ? def.format(best.value) : "—"}
            </p>
            <p className="text-muted-foreground mt-1 truncate text-sm">
              {best ? best.row.label : "No data yet"}
            </p>
          </Card>
        );
      })}
    </div>
  );
}

/* ---------- Ranking (custom bars) ---------- */

function RankingCard({ rows }: { rows: Row[] }) {
  const [metric, setMetric] = React.useState<MetricKey>("views");
  const [showAll, setShowAll] = React.useState(false);
  const def = METRICS[metric];

  const ranked = React.useMemo(
    () =>
      rows
        .map((row) => ({ row, value: def.read(row) }))
        .filter((item): item is { row: Row; value: number } => item.value != null)
        .sort((a, b) => b.value - a.value),
    [rows, def],
  );
  const max = ranked.reduce((acc, item) => Math.max(acc, item.value), 0);
  const visible = showAll ? ranked : ranked.slice(0, 8);

  return (
    <AnalyticsSection
      title="Channel ranking"
      description="Compare every channel on one metric."
      action={
        <div className="max-w-full overflow-x-auto">
          <SegmentedControl
            label="Ranking metric"
            size="sm"
            value={metric}
            onChange={(value) => setMetric(value)}
            options={(Object.keys(METRICS) as MetricKey[]).map((key) => ({
              value: key,
              label: METRICS[key].label,
            }))}
          />
        </div>
      }
    >
      {ranked.length === 0 ? (
        <p className="text-muted-foreground text-sm">Not enough data yet.</p>
      ) : (
        <ol className="flex flex-col gap-3.5">
          {visible.map((item, index) => {
            const width = max > 0 ? Math.max(0, (item.value / max) * 100) : 0;
            return (
              <li key={item.row.id}>
                <Link href={`/accounts/${item.row.id}`} className="group flex items-center gap-3">
                  <span className="text-muted-foreground w-4 shrink-0 text-xs tabular-nums">
                    {index + 1}
                  </span>
                  <Avatar src={item.row.avatar} name={item.row.title} size={30} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-foreground truncate text-sm font-medium group-hover:underline">
                        {item.row.label}
                      </span>
                      <span className="text-foreground shrink-0 text-sm font-semibold tabular-nums">
                        {def.format(item.value)}
                      </span>
                    </div>
                    <div className="bg-muted mt-1.5 h-2.5 overflow-hidden rounded-full">
                      <div
                        className="h-full rounded-full transition-[width] duration-700 ease-out"
                        style={{
                          width: `${width}%`,
                          background: `linear-gradient(90deg, ${GRADIENT_FROM}, ${GRADIENT_TO})`,
                        }}
                      />
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
      {ranked.length > 8 ? (
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => setShowAll((value) => !value)}
        >
          {showAll ? "Show top 8" : `Show all ${ranked.length}`}
        </Button>
      ) : null}
    </AnalyticsSection>
  );
}

/* ---------- Share of views (donut) ---------- */

function ShareCard({ rows }: { rows: Row[] }) {
  const withViews = rows.filter((row) => row.views > 0).sort((a, b) => b.views - a.views);
  const total = withViews.reduce((sum, row) => sum + row.views, 0);
  const others = withViews.slice(6).reduce((sum, row) => sum + row.views, 0);
  const data = [
    ...withViews
      .slice(0, 6)
      .map((row) => ({ name: row.label, value: row.views, color: row.color })),
    ...(others > 0 ? [{ name: "Others", value: others, color: "#94a3b8" }] : []),
  ];

  return (
    <AnalyticsSection title="Share of total views" description="Which channels bring the views.">
      {total === 0 ? (
        <p className="text-muted-foreground text-sm">No views recorded yet.</p>
      ) : (
        <div className="flex flex-col items-center gap-5">
          <div className="relative h-48 w-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="64%"
                  outerRadius="94%"
                  paddingAngle={data.length > 1 ? 2 : 0}
                  stroke="none"
                >
                  {data.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(value, name) => [fmtFull(Number(value)), String(name)]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
              <div>
                <p className="text-foreground text-xl font-semibold tracking-tight">
                  {fmtCompact(total)}
                </p>
                <p className="text-muted-foreground text-xs">total views</p>
              </div>
            </div>
          </div>
          <ul className="flex w-full flex-col gap-2">
            {data.map((item) => (
              <li key={item.name} className="flex items-center gap-2.5 text-sm">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-foreground min-w-0 flex-1 truncate">{item.name}</span>
                <span className="text-muted-foreground tabular-nums">
                  {((item.value / total) * 100).toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </AnalyticsSection>
  );
}

/* ---------- Column chart card ---------- */

function ColumnCard({
  title,
  description,
  name,
  data,
  format,
  colorFor,
  referenceValue,
}: {
  title: string;
  description: string;
  name: string;
  data: Array<{ label: string; value: number }>;
  format: (value: number) => string;
  colorFor?: (value: number) => string;
  referenceValue?: number;
}) {
  const gradientId = `grad-${React.useId().replace(/:/g, "")}`;

  return (
    <AnalyticsSection title={title} description={description}>
      {data.length === 0 ? (
        <p className="text-muted-foreground text-sm">Not enough data yet.</p>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GRADIENT_FROM} />
                  <stop offset="100%" stopColor={GRADIENT_TO} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                interval={0}
                tick={AXIS_TICK}
                tickFormatter={(value) => shorten(String(value))}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={48}
                tick={AXIS_TICK}
                tickFormatter={(value) => fmtCompact(Number(value))}
                domain={
                  referenceValue != null
                    ? [0, (max: number) => Math.max(max, referenceValue * 1.25)]
                    : [0, "auto"]
                }
              />
              <Tooltip
                cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                contentStyle={TOOLTIP_STYLE}
                formatter={(value) => [format(Number(value)), name]}
              />
              {referenceValue != null ? (
                <ReferenceLine
                  y={referenceValue}
                  stroke="var(--muted-foreground)"
                  strokeDasharray="4 4"
                />
              ) : null}
              <Bar
                dataKey="value"
                name={name}
                radius={[8, 8, 0, 0]}
                maxBarSize={44}
                fill={`url(#${gradientId})`}
              >
                {colorFor
                  ? data.map((item) => <Cell key={item.label} fill={colorFor(item.value)} />)
                  : null}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </AnalyticsSection>
  );
}

/* ---------- Best video per channel ---------- */

function TopVideosCard({ rows }: { rows: Row[] }) {
  const items = rows
    .filter((row): row is Row & { topVideo: NonNullable<Row["topVideo"]> } => row.topVideo != null)
    .sort((a, b) => b.topVideo.views - a.topVideo.views)
    .slice(0, 6);
  const max = items.reduce((acc, item) => Math.max(acc, item.topVideo.views), 0);

  return (
    <AnalyticsSection
      title="Best video per channel"
      description="Top performing upload of each channel."
    >
      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">No videos synced yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              <div className="bg-muted aspect-video w-24 shrink-0 overflow-hidden rounded-lg">
                {item.topVideo.thumbnail_url ? (
                  <img
                    src={item.topVideo.thumbnail_url}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="size-full object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <a
                  href={`https://www.youtube.com/watch?v=${encodeURIComponent(item.topVideo.video_id)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-foreground line-clamp-1 text-sm font-medium hover:underline"
                >
                  {item.topVideo.title}
                </a>
                <p className="text-muted-foreground mt-0.5 truncate text-xs">{item.label}</p>
                <div className="mt-2 flex items-center gap-2.5">
                  <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${max > 0 ? Math.max(2, (item.topVideo.views / max) * 100) : 0}%`,
                        background: `linear-gradient(90deg, ${GRADIENT_FROM}, ${GRADIENT_TO})`,
                      }}
                    />
                  </div>
                  <span className="text-foreground shrink-0 text-xs font-semibold tabular-nums">
                    {fmtFull(item.topVideo.views)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AnalyticsSection>
  );
}

/* ---------- Data health ---------- */

type StatusKey = "ready" | "stale" | "unsynced" | "syncing" | "failed" | "reconnect" | "off";

const STATUS_META: Record<StatusKey, { label: string; color: string }> = {
  ready: { label: "Ready", color: "#16a34a" },
  stale: { label: "Stale data", color: "#f59e0b" },
  unsynced: { label: "Not synced", color: "#94a3b8" },
  syncing: { label: "Syncing", color: "#3b6cff" },
  failed: { label: "Sync failed", color: "#dc2626" },
  reconnect: { label: "Reconnect", color: "#ef4444" },
  off: { label: "Analytics off", color: "#f97316" },
};

function statusOf(channel: Channel): StatusKey {
  if (channel.needs_reconnect) return "reconnect";
  if (!channel.analytics_enabled) return "off";
  if (channel.sync.status === "running") return "syncing";
  if (channel.sync.status === "failed") return "failed";
  if (!channel.sync.last_synced_at) return "unsynced";
  if (channel.sync.is_stale) return "stale";
  return "ready";
}

function HealthCard({ channels }: { channels: Channel[] }) {
  const counts = new Map<StatusKey, number>();
  for (const channel of channels) {
    const key = statusOf(channel);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const entries = (Object.keys(STATUS_META) as StatusKey[])
    .map((key) => ({ key, count: counts.get(key) ?? 0 }))
    .filter((item) => item.count > 0);

  return (
    <AnalyticsSection title="Data health" description="How fresh the data of your channels is.">
      <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full">
        {entries.map((item) => (
          <div
            key={item.key}
            title={`${STATUS_META[item.key].label}: ${item.count}`}
            style={{
              flex: item.count,
              backgroundColor: STATUS_META[item.key].color,
            }}
          />
        ))}
      </div>
      <ul className="mt-5 flex flex-col gap-2.5">
        {entries.map((item) => (
          <li key={item.key} className="flex items-center gap-2.5 text-sm">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: STATUS_META[item.key].color }}
            />
            <span className="text-foreground flex-1">{STATUS_META[item.key].label}</span>
            <span className="text-muted-foreground tabular-nums">
              {item.count} of {channels.length}
            </span>
          </li>
        ))}
      </ul>
    </AnalyticsSection>
  );
}