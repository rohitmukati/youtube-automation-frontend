"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { AIReportView } from "@/features/analytics/components/ai-report-view";
import {
  AnalyticsError,
  AnalyticsLoading,
  AnalyticsSection,
  AvailableNotice,
  formatCount,
  formatDuration,
  formatPercent,
  readableKey,
} from "@/features/analytics/components/analytics-primitives";
import {
  useAnalyticsComments,
  useAnalyticsVideo,
  useAnalyticsVideoData,
  useCreateAIReport,
  useAILanguage,
  useStartAnalyticsSync,
} from "@/features/analytics/hooks";
import { toApiError } from "@/lib/api/errors";
import { formatDate, formatDateTime } from "@/lib/format";
import type { AIReport, AILanguage } from "@/types/api";

const chartColor = "var(--primary)";
const chartColors = ["#2563eb", "#14b8a6", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

export function AnalyticsVideoDetail() {
  const params = useParams<{ accountId: string; videoId: string }>();
  const router = useRouter();
  const { accountId, videoId } = params;
  const reconnect = () => router.push(`/accounts/${accountId}`);
  const openOAuthSettings = () => router.push("/accounts?oauth=1");
  const detail = useAnalyticsVideo(accountId, videoId);
  const analytics = useAnalyticsVideoData(accountId, videoId);
  const comments = useAnalyticsComments(accountId, videoId);
  const create = useCreateAIReport(accountId);
  const [report, setReport] = React.useState<AIReport | null>(null);
  const [language, setLanguage] = useAILanguage();
  const sync = useStartAnalyticsSync(accountId);
  const aiError = create.error ? toApiError(create.error) : null;
  const commentsError = comments.error ? toApiError(comments.error) : null;

  function reviewVideo() {
    create.mutate(
      { report_type: "video_review", video_id: videoId, days: 28, language },
      { onSuccess: setReport },
    );
  }

  if (detail.isLoading) return <AnalyticsLoading rows={5} />;
  if (detail.isError || !detail.data) {
    return (
      <AnalyticsError
        error={detail.error}
        retry={() => void detail.refetch()}
        onReconnect={reconnect}
        onOAuthSettings={openOAuthSettings}
      />
    );
  }
  const video = detail.data.video;
  const comparison = detail.data.comparison;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={video.title}
        description={`Published ${formatDate(video.published_at)} · ${video.is_short ? "Short" : "Video"} · ${video.privacy_status}`}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => router.push(`/accounts/${accountId}?tab=videos`)}
            >
              Back to videos
            </Button>
            <label className="text-body flex items-center gap-2 text-sm">
              <span className="sr-only">AI report language</span>
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
            {aiError?.code !== "ai_not_configured" ? (
              <Button loading={create.isPending} onClick={reviewVideo}>
                Review this video with AI
              </Button>
            ) : null}
          </>
        }
      />

      <Card className="flex flex-wrap gap-4 p-4 sm:p-6">
        <img
          src={video.thumbnail_url ?? ""}
          alt=""
          className="bg-muted aspect-video w-full max-w-md rounded-2xl object-cover"
        />
        <div className="grid flex-1 grid-cols-2 content-start gap-4">
          <VideoMetric label="Views" value={formatCount(video.view_count)} />
          <VideoMetric label="Likes" value={formatCount(video.like_count)} />
          <VideoMetric label="Comments" value={formatCount(video.comment_count)} />
          <VideoMetric label="Engagement rate" value={formatPercent(video.engagement_rate)} />
          <VideoMetric label="Duration" value={formatDuration(video.duration_seconds)} />
          <VideoMetric
            label="Channel rank"
            value={
              comparison.rank_by_views == null
                ? "—"
                : `#${comparison.rank_by_views} of ${comparison.total_videos} ${video.is_short ? "Shorts" : "videos"}`
            }
          />
          <VideoMetric
            label="Views vs channel median"
            value={
              comparison.views_vs_median == null
                ? "—"
                : `${comparison.views_vs_median.toFixed(1)}x median`
            }
          />
          <VideoMetric
            label="Engagement vs channel average"
            value={
              comparison.engagement_vs_average == null
                ? "—"
                : `${comparison.engagement_vs_average.toFixed(1)}x average`
            }
          />
          <div className="col-span-2">
            <p className="text-muted-foreground text-xs">Channel comparison</p>
            <p className="text-foreground mt-1 font-semibold capitalize">
              {comparison.performance_label.replaceAll("_", " ")}
            </p>
          </div>
        </div>
      </Card>
      {detail.data.description ? (
        <AnalyticsSection title="Description">
          <p className="text-body text-sm whitespace-pre-wrap">{detail.data.description}</p>
        </AnalyticsSection>
      ) : null}
      {analytics.isError && analytics.data ? (
        <AnalyticsError
          error={analytics.error}
          retry={() => void analytics.refetch()}
          onReconnect={reconnect}
          onOAuthSettings={openOAuthSettings}
        />
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <AnalyticsSection title="Daily views">
          {analytics.isLoading ? (
            <AnalyticsLoading />
          ) : analytics.isError && !analytics.data ? (
            <AnalyticsError
              error={analytics.error}
              retry={() => void analytics.refetch()}
              onReconnect={reconnect}
              onOAuthSettings={openOAuthSettings}
            />
          ) : analytics.data?.daily.available ? (
            analytics.data.daily.rows.length ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.data.daily.rows}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value: string) => value.slice(5)} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="views" stroke={chartColor} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No daily data available.</p>
            )
          ) : (
            <AvailableNotice
              section={
                analytics.data?.daily ?? {
                  available: false,
                  message: "Loading analytics.",
                  rows: [],
                }
              }
            />
          )}
        </AnalyticsSection>
        <AnalyticsSection title="Audience retention">
          {analytics.isLoading ? (
            <AnalyticsLoading />
          ) : analytics.isError && !analytics.data ? (
            <AnalyticsError
              error={analytics.error}
              retry={() => void analytics.refetch()}
              onReconnect={reconnect}
              onOAuthSettings={openOAuthSettings}
            />
          ) : analytics.data?.retention.available ? (
            analytics.data.retention.rows.length ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.data.retention.rows}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="elapsed_ratio"
                      tickFormatter={(value: number) => `${Math.round(value * 100)}%`}
                    />
                    <YAxis tickFormatter={(value: number) => `${Math.round(value * 100)}%`} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="audience_watch_ratio"
                      name="Audience retention"
                      stroke={chartColor}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No retention data available.</p>
            )
          ) : (
            <AvailableNotice
              section={
                analytics.data?.retention ?? {
                  available: false,
                  message: "Loading analytics.",
                  rows: [],
                }
              }
            />
          )}
        </AnalyticsSection>
      </div>

      {analytics.data ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <VideoBreakdown title="Traffic sources" section={analytics.data.traffic_sources} />
          <AnalyticsSection title="Search terms">
            <AvailableNotice section={analytics.data.search_terms} />
            {analytics.data.search_terms.available ? (
              <VideoAnalyticsRows
                rows={analytics.data.search_terms.rows.map((row) => ({
                  label: row.key,
                  views: row.views,
                  share: row.share_percent,
                }))}
                empty={analytics.data.search_terms.message || "No search terms available."}
              />
            ) : null}
          </AnalyticsSection>
          <AnalyticsSection title="Demographics">
            <AvailableNotice section={analytics.data.demographics} />
            {analytics.data.demographics.available && analytics.data.demographics.rows.length ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.data.demographics.rows}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="age_group" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="viewer_percentage" fill={chartColor} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : analytics.data.demographics.available ? (
              <p className="text-muted-foreground text-sm">
                {analytics.data.demographics.message || "Not enough data yet."}
              </p>
            ) : null}
          </AnalyticsSection>
        </div>
      ) : null}

      <AnalyticsSection title="Top comments">
        {comments.isLoading && !comments.data ? (
          <AnalyticsLoading />
        ) : comments.isError &&
          !comments.data &&
          commentsError?.code === "comments_permission_missing" ? (
          <Alert
            tone="warning"
            title="Reconnect this channel to read comments"
            action={
              <Button size="sm" variant="outline" onClick={reconnect}>
                Reconnect
              </Button>
            }
          >
            Reconnect this channel to read comments.
          </Alert>
        ) : comments.isError && !comments.data ? (
          <AnalyticsError
            error={comments.error}
            retry={() => void comments.refetch()}
            onReconnect={reconnect}
            onOAuthSettings={openOAuthSettings}
          />
        ) : comments.data?.comments_disabled ? (
          <p className="text-muted-foreground text-sm">Comments are turned off for this video.</p>
        ) : comments.data?.comments.length ? (
          <div className="flex flex-col gap-3">
            {comments.data.comments.map((comment, index) => (
              <Card key={`${comment.published_at}-${index}`} className="p-3.5">
                <p className="text-body text-sm">{comment.text}</p>
                <p className="text-muted-foreground mt-2 text-xs">
                  {formatCount(comment.like_count)} likes · {formatCount(comment.reply_count)}{" "}
                  replies · {formatDateTime(comment.published_at)}
                </p>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No comments to show.</p>
        )}
      </AnalyticsSection>

      {create.isPending ? (
        <Alert tone="info" title="Analysing your video">
          This can take up to a minute.
        </Alert>
      ) : null}
      {aiError ? (
        <Alert
          tone={
            aiError.code === "analytics_not_synced" ||
            aiError.code === "ai_limit_reached" ||
            aiError.code === "youtube_quota_exceeded"
              ? "warning"
              : "danger"
          }
          title={
            aiError.code === "analytics_permission_missing" ||
            (aiError.code === "validation_error" &&
              `${aiError.message} ${aiError.details.map((item) => item.message).join(" ")}`
                .toLowerCase()
                .includes("reconnect"))
              ? "Reconnect this channel to restore analytics access"
              : aiError.code === "analytics_not_synced"
                ? "Load the channel data first"
                : aiError.code === "ai_not_configured"
                  ? "AI insights unavailable"
                  : aiError.code === "youtube_api_not_enabled"
                    ? "YouTube API is not enabled"
                    : "AI review could not be generated"
          }
          action={
            aiError.code === "analytics_permission_missing" ? (
              <Button size="sm" variant="outline" onClick={reconnect}>
                Reconnect
              </Button>
            ) : aiError.code === "validation_error" &&
              `${aiError.message} ${aiError.details.map((item) => item.message).join(" ")}`
                .toLowerCase()
                .includes("reconnect") ? (
              <Button size="sm" variant="outline" onClick={reconnect}>
                Reconnect
              </Button>
            ) : aiError.code === "analytics_not_synced" ? (
              <Button size="sm" onClick={() => sync.mutate()}>
                Sync channel
              </Button>
            ) : aiError.code === "youtube_api_not_enabled" ? (
              <Button size="sm" variant="outline" onClick={openOAuthSettings}>
                OAuth settings
              </Button>
            ) : [
                "ai_busy",
                "ai_blocked",
                "ai_generation_failed",
                "youtube_unavailable",
                "youtube_bad_request",
                "youtube_forbidden",
              ].includes(aiError.code) ? (
              <Button size="sm" variant="outline" onClick={reviewVideo}>
                Retry
              </Button>
            ) : undefined
          }
        >
          {aiError.code === "analytics_permission_missing" ||
          (aiError.code === "validation_error" &&
            `${aiError.message} ${aiError.details.map((item) => item.message).join(" ")}`
              .toLowerCase()
              .includes("reconnect"))
            ? "Analytics permission is missing. Reconnect this channel to grant access."
            : aiError.code === "ai_not_configured"
              ? "AI insights are not available right now."
              : aiError.code === "youtube_quota_exceeded"
                ? "The daily YouTube API limit of your Google project is used up. It resets at midnight Pacific Time. Stored data remains available."
                : aiError.code === "youtube_api_not_enabled"
                  ? "The YouTube Data API or YouTube Analytics API is not enabled in your Google Cloud project."
                  : aiError.message}
        </Alert>
      ) : null}
      {report ? <AIReportView report={report} /> : null}
    </div>
  );
}

function VideoMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-foreground mt-1 font-semibold">{value}</p>
    </div>
  );
}

function VideoBreakdown({
  title,
  section,
}: {
  title: string;
  section: {
    available: boolean;
    message: string | null;
    rows: Array<{ key: string; views: number; share_percent: number }>;
  };
}) {
  return (
    <AnalyticsSection title={title}>
      <AvailableNotice section={section} />
      {section.available && section.rows.length ? (
        <div className="grid gap-3 sm:grid-cols-[180px_1fr] sm:items-center">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={section.rows} dataKey="views" nameKey="key" outerRadius={75}>
                  {section.rows.map((row, index) => (
                    <Cell key={row.key} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <VideoAnalyticsRows
            rows={section.rows.map((row) => ({
              label: readableKey(row.key),
              views: row.views,
              share: row.share_percent,
            }))}
            empty="No traffic sources."
          />
        </div>
      ) : section.available ? (
        <p className="text-muted-foreground text-sm">
          {section.message || "No traffic data available."}
        </p>
      ) : null}
    </AnalyticsSection>
  );
}

function VideoAnalyticsRows({
  rows,
  empty,
}: {
  rows: Array<{ label: string; views: number; share: number }>;
  empty: string;
}) {
  if (rows.length === 0) return <p className="text-muted-foreground text-sm">{empty}</p>;
  return (
    <div className="flex flex-col gap-2">
      {rows.map((row, index) => (
        <div key={`${row.label}-${index}`} className="flex justify-between gap-3 text-sm">
          <span className="text-body truncate">{row.label}</span>
          <span className="text-muted-foreground">
            {formatCount(row.views)} · {formatPercent(row.share)}
          </span>
        </div>
      ))}
    </div>
  );
}
