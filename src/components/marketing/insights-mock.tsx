"use client";

import * as React from "react";
import {
  CalendarDays,
  Languages,
  MessageSquare,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { Orb } from "@/components/ui/orb";
import { cn } from "@/lib/utils";

type TabKey = "strategy" | "content" | "schedule";

interface Finding {
  icon: LucideIcon;
  text: string;
}

interface Tab {
  key: TabKey;
  label: string;
  metric: string;
  change: string;
  chart: { kind: "line"; values: number[] } | { kind: "bars"; values: number[]; peak: number };
  findings: Finding[];
  next: { label: string; title: string };
}

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const tabs: Tab[] = [
  {
    key: "strategy",
    label: "Channel strategy",
    metric: "Views",
    change: "+24.8%",
    chart: { kind: "line", values: [92, 84, 88, 66, 72, 48, 54, 30, 18] },
    findings: [
      { icon: TrendingUp, text: "Tutorials earn the longest watch time on this channel." },
      { icon: CalendarDays, text: "Thursday evening uploads perform best with your audience." },
      { icon: MessageSquare, text: "Viewers keep asking for beginner-friendly guides." },
    ],
    next: { label: "Suggested next video", title: "Beginner tutorial · Thursday, 6:00 PM" },
  },
  {
    key: "content",
    label: "Content analysis",
    metric: "Watch time",
    change: "+16.2%",
    chart: { kind: "line", values: [74, 78, 62, 66, 52, 58, 40, 36, 24] },
    findings: [
      { icon: TrendingUp, text: "Short, specific titles bring in more clicks than long ones." },
      {
        icon: MessageSquare,
        text: "Your best tags are search-focused. Broad tags are holding reach back.",
      },
      {
        icon: CalendarDays,
        text: "Three older videos are underperforming and need fresh thumbnails.",
      },
    ],
    next: { label: "Suggested action", title: "Refresh thumbnails on 3 older videos" },
  },
  {
    key: "schedule",
    label: "Publishing schedule",
    metric: "Performance by weekday",
    change: "Best: Thu",
    chart: { kind: "bars", values: [38, 52, 46, 100, 74, 58, 32], peak: 3 },
    findings: [
      { icon: CalendarDays, text: "Thursday at 6 PM is your strongest upload slot." },
      { icon: TrendingUp, text: "Weekend uploads get the lowest early views on this channel." },
      { icon: MessageSquare, text: "Two uploads a week keeps your audience coming back." },
    ],
    next: { label: "Suggested schedule", title: "Tuesday and Thursday, 6:00 PM" },
  },
];

function smoothPath(values: number[], width: number) {
  const step = width / (values.length - 1);
  return values
    .map((y, index) => {
      const x = index * step;
      if (index === 0) return `M0 ${y}`;
      const previousX = (index - 1) * step;
      const previousY = values[index - 1];
      const mid = previousX + step / 2;
      return `C${mid} ${previousY} ${mid} ${y} ${x} ${y}`;
    })
    .join(" ");
}

function LineChart({ values }: { values: number[] }) {
  const line = smoothPath(values, 320);
  return (
    <svg viewBox="0 0 320 120" preserveAspectRatio="none" className="mt-3 h-28 w-full" aria-hidden>
      <defs>
        <linearGradient id="insight-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--orb-c)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--orb-c)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="insight-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--orb-b)" />
          <stop offset="100%" stopColor="var(--orb-c)" />
        </linearGradient>
      </defs>
      <path d={`${line} L320 120 L0 120 Z`} fill="url(#insight-area)" />
      <path
        d={line}
        fill="none"
        stroke="url(#insight-line)"
        strokeWidth="2.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function BarChart({ values, peak }: { values: number[]; peak: number }) {
  return (
    <div className="mt-3" aria-hidden>
      <div className="flex h-24 items-end gap-2">
        {values.map((height, index) => (
          <div key={weekdayLabels[index]} className="flex h-full flex-1 items-end">
            <div
              className={cn("w-full rounded-t-md", index !== peak && "bg-border")}
              style={{
                height: `${height}%`,
                background:
                  index === peak
                    ? "linear-gradient(to top, var(--orb-b), var(--orb-a))"
                    : undefined,
              }}
            />
          </div>
        ))}
      </div>
      <div className="text-muted-foreground mt-1.5 flex gap-2 text-[10px]">
        {weekdayLabels.map((label) => (
          <span key={label} className="flex-1 text-center">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function InsightsMock() {
  const [active, setActive] = React.useState<TabKey>("strategy");
  const current = tabs.find((tab) => tab.key === active) ?? tabs[0];

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const index = tabs.findIndex((tab) => tab.key === active);
    const offset = event.key === "ArrowRight" ? 1 : -1;
    const next = tabs[(index + offset + tabs.length) % tabs.length];
    setActive(next.key);
    document.getElementById(`insight-tab-${next.key}`)?.focus();
  }

  return (
    <div
      className="relative w-full max-w-xl"
      role="group"
      aria-label="Interactive preview of an AI channel report using sample data"
    >
      <Orb
        size="14rem"
        variant="lagoon"
        blur
        className="animate-orb-slow absolute -right-6 -bottom-8 opacity-40"
      />
      <Orb
        size="12rem"
        variant="sunset"
        blur
        className="animate-orb absolute -top-8 -left-6 opacity-40"
      />

      <div className="border-border bg-card/90 shadow-float relative overflow-hidden rounded-3xl border p-4 backdrop-blur sm:rounded-[28px] sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="bg-primary text-primary-foreground grid size-10 place-items-center rounded-xl">
              <Sparkles className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-foreground text-sm font-semibold">AI channel report</p>
              <p className="text-muted-foreground text-xs">Last 28 days · Sample data</p>
            </div>
          </div>
          <span className="bg-muted text-body hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium sm:inline-flex">
            <Languages className="size-3.5" aria-hidden />
            English or Hinglish
          </span>
        </div>

        <div
          role="tablist"
          aria-label="Report type"
          onKeyDown={onKeyDown}
          className="mt-4 flex flex-wrap gap-2"
        >
          {tabs.map((tab) => {
            const selected = tab.key === active;
            return (
              <button
                key={tab.key}
                id={`insight-tab-${tab.key}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls="insight-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(tab.key)}
                className={cn(
                  "focus-visible:outline-foreground cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
                  selected
                    ? "bg-foreground text-background"
                    : "bg-muted text-body hover:bg-border hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div
          key={current.key}
          id="insight-panel"
          role="tabpanel"
          aria-labelledby={`insight-tab-${current.key}`}
          className="animate-rise"
        >
          <div className="bg-muted/70 mt-4 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-xs">{current.metric}</p>
              <span className="bg-success-soft text-success inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium">
                <TrendingUp className="size-3" aria-hidden />
                {current.change}
              </span>
            </div>
            {current.chart.kind === "line" ? (
              <LineChart values={current.chart.values} />
            ) : (
              <BarChart values={current.chart.values} peak={current.chart.peak} />
            )}
          </div>

          <ul className="mt-4 flex flex-col gap-2.5">
            {current.findings.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-[13px]">
                <span className="bg-muted text-foreground mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg">
                  <Icon className="size-3.5" aria-hidden />
                </span>
                <span className="text-body leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>

          <div className="border-border mt-4 flex items-center justify-between gap-3 rounded-2xl border border-dashed px-4 py-3">
            <div className="min-w-0">
              <p className="text-muted-foreground text-[11px]">{current.next.label}</p>
              <p className="text-foreground truncate text-[13px] font-medium">
                {current.next.title}
              </p>
            </div>
            <span className="bg-foreground text-background inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium">
              <Sparkles className="size-3.5" aria-hidden />
              Plan it
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}