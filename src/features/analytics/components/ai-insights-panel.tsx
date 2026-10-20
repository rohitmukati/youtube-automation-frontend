"use client";

import * as React from "react";
import { toast } from "sonner";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  useAIReports,
  useCreateAIReport,
  useDeleteAIReport,
  useAILanguage,
  useStartAnalyticsSync,
} from "@/features/analytics/hooks";
import { AIReportView } from "@/features/analytics/components/ai-report-view";
import {
  AnalyticsError,
  AnalyticsLoading,
} from "@/features/analytics/components/analytics-primitives";
import { getErrorMessage, toApiError } from "@/lib/api/errors";
import { formatDate } from "@/lib/format";
import type { AIReport, AIReportType, AILanguage } from "@/types/api";

const reportOptions: Array<{ type: AIReportType; title: string; description: string }> = [
  {
    type: "channel_strategy",
    title: "Channel strategy",
    description: "Priorities to grow this channel.",
  },
  {
    type: "content_analysis",
    title: "Content analysis",
    description: "What is working and what needs attention.",
  },
  {
    type: "publishing_schedule",
    title: "Publishing schedule",
    description: "A data-led schedule for future uploads.",
  },
  {
    type: "audience_keywords",
    title: "Audience and keywords",
    description: "Topics and search opportunities for viewers.",
  },
  {
    type: "comments_insights",
    title: "Comments insights",
    description: "Themes and ideas from viewer comments.",
  },
  {
    type: "content_plan",
    title: "30-day content plan",
    description: "A practical month of content ideas.",
  },
];

export function AIInsightsPanel({
  accountId,
  onReconnect,
  onOAuthSettings,
}: {
  accountId: string;
  onReconnect: () => void;
  onOAuthSettings: () => void;
}) {
  const [language, chooseLanguage] = useAILanguage();
  const [days, setDays] = React.useState(28);
  const [activeReport, setActiveReport] = React.useState<AIReport | null>(null);
  const [activeReportId, setActiveReportId] = React.useState<string | null>(null);
  const create = useCreateAIReport(accountId);
  const sync = useStartAnalyticsSync(accountId);
  const reports = useAIReports({ account_id: accountId, limit: 50, offset: 0 });
  const deleteReport = useDeleteAIReport();

  function generate(reportType: AIReportType, force = false) {
    create.mutate(
      { report_type: reportType, days, language, force },
      {
        onSuccess: (report) => {
          setActiveReport(report);
          setActiveReportId(null);
        },
      },
    );
  }

  async function removeReport(id: string) {
    try {
      await deleteReport.mutateAsync(id);
      if (activeReportId === id) setActiveReportId(null);
      toast.success("Report deleted.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  const createError = create.error ? toApiError(create.error) : null;
  const unavailable = createError?.code === "ai_not_configured";

  return (
    <div className="flex flex-col gap-5">
      {create.isPending ? (
        <Alert tone="info" title="Analysing your channel data">
          This can take up to a minute. Keep this page open while the report is generated.
        </Alert>
      ) : null}

      {createError ? (
        <AIError
          error={create.error}
          retry={() => {
            if (create.variables) create.mutate(create.variables);
          }}
          sync={() => sync.mutate()}
          syncing={sync.isPending}
          unavailable={unavailable}
          onReconnect={onReconnect}
          onOAuthSettings={onOAuthSettings}
        />
      ) : null}
      {sync.isError ? (
        <AnalyticsError
          error={sync.error}
          retry={() => sync.mutate()}
          onReconnect={onReconnect}
          onOAuthSettings={onOAuthSettings}
        />
      ) : null}

      {activeReport ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-foreground text-lg font-semibold">Report</h2>
            <Button variant="outline" size="sm" onClick={() => setActiveReport(null)}>
              Close report
            </Button>
          </div>
          <AIReportView report={activeReport} />
        </div>
      ) : activeReportId ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-foreground text-lg font-semibold">Saved report</h2>
            <Button variant="outline" size="sm" onClick={() => setActiveReportId(null)}>
              Close report
            </Button>
          </div>
          <AIReportView reportId={activeReportId} />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-foreground text-lg font-semibold">AI channel insights</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Generate a focused report from your channel data.
              </p>
            </div>
            <label className="text-body flex items-center gap-2 text-sm">
              Report language
              <select
                className="border-border-strong bg-background text-foreground h-9 rounded-xl border px-3"
                value={language}
                onChange={(event) => chooseLanguage(event.target.value as AILanguage)}
              >
                <option value="en">English</option>
                <option value="hinglish">Hinglish</option>
              </select>
            </label>
            <label className="text-body flex items-center gap-2 text-sm">
              Period
              <select
                className="border-border-strong bg-background text-foreground h-9 rounded-xl border px-3"
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
          </div>
          {!unavailable ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {reportOptions.map((option) => (
                <ReportTypeCard
                  key={option.type}
                  accountId={accountId}
                  type={option.type}
                  title={option.title}
                  description={option.description}
                  language={language}
                  generating={create.isPending && create.variables?.report_type === option.type}
                  disabled={create.isPending}
                  onGenerate={(force) => generate(option.type, force)}
                  onView={(id) => {
                    setActiveReport(null);
                    setActiveReportId(id);
                  }}
                />
              ))}
            </div>
          ) : null}
          <section className="flex flex-col gap-3">
            <h3 className="text-foreground font-semibold">Past reports</h3>
            <PastReports
              reports={reports.data?.reports ?? []}
              loading={reports.isLoading}
              error={reports.isError ? reports.error : null}
              retry={() => void reports.refetch()}
              onView={(id) => setActiveReportId(id)}
              onDelete={(id) => void removeReport(id)}
              deleting={deleteReport.isPending}
            />
          </section>
        </>
      )}
    </div>
  );
}

function ReportTypeCard({
  accountId,
  type,
  title,
  description,
  language,
  generating,
  disabled,
  onGenerate,
  onView,
}: {
  accountId: string;
  type: AIReportType;
  title: string;
  description: string;
  language: AILanguage;
  generating: boolean;
  disabled: boolean;
  onGenerate: (force: boolean) => void;
  onView: (id: string) => void;
}) {
  const latest = useAIReports({ account_id: accountId, report_type: type, limit: 1, offset: 0 });
  const report = latest.data?.reports[0];
  return (
    <Card className="flex flex-col p-4">
      <h3 className="text-foreground font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-1 min-h-10 text-sm">{description}</p>
      {latest.isLoading ? (
        <div className="mt-3">
          <AnalyticsLoading rows={1} />
        </div>
      ) : latest.isError ? (
        <div className="mt-3">
          <AnalyticsError error={latest.error} retry={() => void latest.refetch()} />
        </div>
      ) : report ? (
        <div className="bg-muted mt-3 rounded-xl p-3">
          <p className="text-foreground line-clamp-2 text-sm font-medium">{report.headline}</p>
          <p className="text-muted-foreground mt-1 text-xs">{formatDate(report.created_at)}</p>
        </div>
      ) : (
        <p className="text-muted-foreground bg-muted mt-3 rounded-xl p-3 text-sm">
          No saved report yet.
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {report ? (
          <Button size="sm" variant="outline" onClick={() => onView(report.id)}>
            View
          </Button>
        ) : (
          <Button
            size="sm"
            loading={generating && !report}
            disabled={disabled && !generating}
            onClick={() => onGenerate(false)}
          >
            Generate
          </Button>
        )}
        {report ? (
          <Button
            size="sm"
            variant="soft"
            loading={generating}
            disabled={disabled && !generating}
            onClick={() => onGenerate(true)}
          >
            Regenerate
          </Button>
        ) : null}
      </div>
      <span className="sr-only">Selected language: {language}</span>
    </Card>
  );
}

function PastReports({
  reports,
  loading,
  error,
  retry,
  onView,
  onDelete,
  deleting,
}: {
  reports: Array<{
    id: string;
    report_type: string;
    headline: string;
    created_at: string;
    score: number | null;
  }>;
  loading: boolean;
  error: unknown;
  retry: () => void;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  if (loading) return <AnalyticsLoading rows={2} />;
  if (error) return <AnalyticsError error={error} retry={retry} />;
  if (reports.length === 0)
    return <p className="text-muted-foreground text-sm">Saved reports will appear here.</p>;
  return (
    <div className="flex flex-col gap-2">
      {reports.map((report) => (
        <Card key={report.id} className="flex flex-wrap items-center justify-between gap-3 p-3.5">
          <div className="min-w-0">
            <p className="text-foreground truncate text-sm font-medium">{report.headline}</p>
            <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-xs">
              <Badge tone="neutral">{report.report_type.replaceAll("_", " ")}</Badge>
              <span>{formatDate(report.created_at)}</span>
              {report.score !== null ? <span>Score {report.score}</span> : null}
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onView(report.id)}>
              View
            </Button>
            <Button
              size="sm"
              variant="danger-outline"
              disabled={deleting}
              onClick={() => onDelete(report.id)}
            >
              Delete
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function AIError({
  error,
  retry,
  sync,
  syncing,
  unavailable,
  onReconnect,
  onOAuthSettings,
}: {
  error: unknown;
  retry: () => void;
  sync: () => void;
  syncing: boolean;
  unavailable: boolean;
  onReconnect: () => void;
  onOAuthSettings: () => void;
}) {
  const apiError = toApiError(error);
  if (unavailable) {
    return (
      <Alert tone="info" title="AI insights unavailable">
        AI insights are not available right now.
      </Alert>
    );
  }
  if (apiError.code === "analytics_not_synced") {
    return (
      <Alert
        tone="warning"
        title="Load the channel data first"
        action={
          <Button size="sm" loading={syncing} onClick={sync}>
            Sync channel
          </Button>
        }
      >
        Load the channel data first, then generate an AI report.
      </Alert>
    );
  }
  if (apiError.code === "ai_limit_reached") {
    return (
      <Alert tone="warning" title="AI report limit reached">
        {apiError.message}
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
        title="Reconnect this channel to restore analytics access"
        action={
          <Button size="sm" variant="outline" onClick={onReconnect}>
            Reconnect
          </Button>
        }
      >
        This report needs YouTube Analytics permission.
      </Alert>
    );
  }
  if (apiError.code === "youtube_api_not_enabled") {
    return (
      <Alert
        tone="danger"
        title="YouTube API is not enabled"
        action={
          <Button size="sm" variant="outline" onClick={onOAuthSettings}>
            OAuth settings
          </Button>
        }
      >
        Enable YouTube Data API v3 and YouTube Analytics API in Google Cloud, then reconnect the
        channel.
      </Alert>
    );
  }
  if (apiError.code === "youtube_quota_exceeded") {
    return (
      <Alert tone="warning" title="YouTube daily limit reached">
        The daily YouTube API limit of your Google project is used up. It resets at midnight Pacific
        Time. Stored data remains available.
      </Alert>
    );
  }
  return (
    <Alert
      tone="danger"
      title="AI report could not be generated"
      action={
        [
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
      {apiError.message || getErrorMessage(error)}
    </Alert>
  );
}
