"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { useAIReport } from "@/features/analytics/hooks";
import { AnalyticsLoading } from "@/features/analytics/components/analytics-primitives";
import { getErrorMessage } from "@/lib/api/errors";
import type { AIReport } from "@/types/api";

export function reportAsText(report: AIReport): string {
  const content = report.content;
  const sections = [
    content.headline,
    content.summary,
    content.score_explanation ? `Score: ${content.score ?? "—"}\n${content.score_explanation}` : "",
    `Strengths\n${content.strengths.map((item) => `- ${item}`).join("\n")}`,
    `Weaknesses\n${content.weaknesses.map((item) => `- ${item}`).join("\n")}`,
    ...content.insights.map(
      (item) =>
        `${item.title}\n${item.finding}\nEvidence: ${item.evidence}\nRecommendation: ${item.recommendation}\nAction steps:\n${item.action_steps.map((step) => `- ${step}`).join("\n")}`,
    ),
    `Quick wins\n${content.quick_wins.map((item) => `- ${item}`).join("\n")}`,
    `Content ideas\n${content.content_ideas.map((item) => `- ${item.title}: ${item.hook}`).join("\n")}`,
    `Experiments\n${content.experiments.map((item) => `- ${item.hypothesis}: ${item.how_to_test} (measure ${item.success_metric})`).join("\n")}`,
    `Data limitations\n${content.data_limitations.map((item) => `- ${item}`).join("\n")}`,
  ];
  return sections.filter(Boolean).join("\n\n");
}

export function AIReportView({
  report: initialReport,
  reportId,
}: {
  report?: AIReport;
  reportId?: string;
}) {
  const fetched = useAIReport(initialReport ? "" : (reportId ?? ""));
  const report = initialReport ?? fetched.data;

  if (!report && fetched.isLoading) return <AnalyticsLoading rows={4} />;
  if (!report && fetched.isError) {
    return (
      <div className="bg-danger-soft flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3">
        <p className="text-danger text-sm">{getErrorMessage(fetched.error)}</p>
        <Button size="sm" variant="outline" onClick={() => void fetched.refetch()}>
          Retry
        </Button>
      </div>
    );
  }
  if (!report) return null;
  const loadedReport: AIReport = report;
  const content = report.content;
  const insights = [...content.insights].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(reportAsText(loadedReport));
      toast.success("Report copied.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not copy the report."));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap gap-2">
              <Badge tone="neutral">{report.report_type.replaceAll("_", " ")}</Badge>
              {report.cached ? (
                <Badge tone="info">Saved report from {formatDate(report.created_at)}</Badge>
              ) : null}
              <Badge tone="neutral">
                {report.language === "hinglish" ? "Hinglish" : "English"}
              </Badge>
            </div>
            <h2 className="text-foreground text-xl font-semibold">{content.headline}</h2>
            <p className="text-muted-foreground mt-2 max-w-3xl text-sm leading-relaxed">
              {content.summary}
            </p>
          </div>
          <Button variant="outline" onClick={() => void copyReport()}>
            Copy as text
          </Button>
        </div>
        {content.score !== null ? (
          <div className="mt-5 flex items-center gap-3">
            <div
              className="grid size-16 shrink-0 place-items-center rounded-full p-1 text-lg font-semibold"
              style={{
                background: `conic-gradient(var(--primary) ${content.score}%, var(--muted) 0)`,
              }}
              aria-label={`Score ${content.score} out of 100`}
            >
              <span className="bg-background text-foreground grid size-full place-items-center rounded-full">
                {content.score}
              </span>
            </div>
            <p className="text-muted-foreground text-sm">{content.score_explanation}</p>
          </div>
        ) : null}
      </Card>

      {report.data_quality.sections_missing.length > 0 ? (
        <div className="bg-warning-soft text-warning rounded-2xl px-4 py-3 text-sm">
          Some sections have limited data: {report.data_quality.sections_missing.join(", ")}.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <ReportList title="Strengths" items={content.strengths} />
        <ReportList title="Areas to improve" items={content.weaknesses} />
      </div>

      {insights.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h3 className="text-foreground text-base font-semibold">Insights and actions</h3>
          <div className="grid gap-3 lg:grid-cols-2">
            {insights.map((insight, index) => (
              <Card key={`${insight.title}-${index}`} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h4 className="text-foreground font-semibold">{insight.title}</h4>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge tone={insight.priority === "high" ? "danger" : "neutral"}>
                      {insight.priority} priority
                    </Badge>
                    <Badge tone="neutral">Impact: {insight.impact}</Badge>
                    <Badge tone="neutral">Effort: {insight.effort}</Badge>
                    <Badge tone="neutral">Confidence: {insight.confidence}</Badge>
                  </div>
                </div>
                <p className="text-body mt-3 text-sm">{insight.finding}</p>
                <p className="text-muted-foreground mt-2 text-xs">Evidence: {insight.evidence}</p>
                <p className="text-foreground mt-3 text-sm font-medium">{insight.recommendation}</p>
                {insight.action_steps.length > 0 ? (
                  <ul className="mt-2 flex flex-col gap-2 text-sm">
                    {insight.action_steps.map((step) => (
                      <li key={step} className="flex gap-2">
                        <input
                          type="checkbox"
                          aria-label={`Mark complete: ${step}`}
                          className="accent-primary mt-1"
                        />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <ReportList title="Quick wins" items={content.quick_wins} />
        <ReportList
          title="Data limitations"
          items={[...content.data_limitations, ...report.data_quality.sections_missing]}
          notice
        />
      </div>

      {content.content_ideas.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h3 className="text-foreground text-base font-semibold">Content ideas</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {content.content_ideas.map((idea, index) => (
              <Card key={`${idea.title}-${index}`} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-foreground font-semibold">{idea.title}</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      void navigator.clipboard.writeText(idea.title).then(
                        () => toast.success("Title copied."),
                        (error: unknown) =>
                          toast.error(getErrorMessage(error, "Could not copy the title.")),
                      );
                    }}
                  >
                    Copy title
                  </Button>
                </div>
                <p className="text-muted-foreground mt-2 text-xs">{idea.format}</p>
                <p className="text-body mt-2 text-sm">{idea.hook}</p>
                <p className="text-muted-foreground mt-2 text-sm">{idea.why_it_should_work}</p>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {content.experiments.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h3 className="text-foreground text-base font-semibold">Experiments</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {content.experiments.map((experiment, index) => (
              <Card key={`${experiment.hypothesis}-${index}`} className="p-4">
                <p className="text-foreground font-medium">{experiment.hypothesis}</p>
                <p className="text-body mt-2 text-sm">{experiment.how_to_test}</p>
                <p className="text-muted-foreground mt-2 text-xs">
                  Success metric: {experiment.success_metric}
                </p>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function ReportList({
  title,
  items,
  notice,
}: {
  title: string;
  items: string[];
  notice?: boolean;
}) {
  return (
    <Card className="p-4">
      <h3 className="text-foreground font-semibold">{title}</h3>
      {items.length === 0 ? (
        <p className="text-muted-foreground mt-2 text-sm">No information reported.</p>
      ) : (
        <ul className={`mt-2 flex flex-col gap-2 text-sm ${notice ? "text-warning" : "text-body"}`}>
          {items.map((item, index) => (
            <li key={`${item}-${index}`}>• {item}</li>
          ))}
        </ul>
      )}
    </Card>
  );
}
