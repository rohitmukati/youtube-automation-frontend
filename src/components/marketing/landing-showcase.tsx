import {
  BarChart3,
  CalendarDays,
  Check,
  Lightbulb,
  MessageSquare,
  Search,
  Sparkles,
  TrendingUp,
  Video,
  type LucideIcon,
} from "lucide-react";
import { InsightsMock } from "@/components/marketing/insights-mock";
import { cn } from "@/lib/utils";

const reportTypes: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: Lightbulb, title: "Channel strategy", body: "Clear priorities to grow each channel." },
  { icon: BarChart3, title: "Content analysis", body: "What is working and what needs attention." },
  {
    icon: CalendarDays,
    title: "Publishing schedule",
    body: "A data-led plan for your next uploads.",
  },
  {
    icon: Search,
    title: "Audience and keywords",
    body: "Topics and search ideas your viewers want.",
  },
  {
    icon: MessageSquare,
    title: "Comments insights",
    body: "Themes and video ideas from your comments.",
  },
  {
    icon: Video,
    title: "30-day content plan",
    body: "A practical month of ideas, ready to publish.",
  },
];

export function AiInsights() {
  return (
    <section id="insights" className="border-border scroll-mt-24 border-t">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-8 sm:py-20 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 lg:py-28">
        <div className="min-w-0">
          <span className="bg-muted text-foreground inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium">
            <Sparkles className="size-3.5" aria-hidden />
            AI analytics
          </span>
          <h2 className="text-foreground mt-5 text-[30px] leading-tight font-medium tracking-tight sm:text-[34px] lg:text-[42px]">
            Let AI read your analytics, so you know what to publish next.
          </h2>
          <p className="text-body mt-4 max-w-xl text-lg">
            Sync a channel and generate reports from its real data: what is growing, what is slowing
            down, and what to make next. Read them in English or Hinglish.
          </p>

          <ul className="mt-8 grid gap-x-6 gap-y-5 sm:grid-cols-2">
            {reportTypes.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="bg-muted text-foreground grid size-9 shrink-0 place-items-center rounded-xl">
                  <Icon className="size-4" strokeWidth={1.7} aria-hidden />
                </span>
                <div>
                  <h3 className="text-foreground text-[15px] font-semibold">{title}</h3>
                  <p className="text-body mt-0.5 text-sm leading-relaxed">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex min-w-0 justify-center lg:justify-end">
          <InsightsMock />
        </div>
      </div>
    </section>
  );
}

const channelRows = [
  {
    name: "Weekly Studio",
    initial: "W",
    color: "var(--orb-b)",
    views: "128K",
    change: "+18%",
    width: "92%",
    up: true,
  },
  {
    name: "Studio Shorts",
    initial: "S",
    color: "var(--orb-c)",
    views: "96K",
    change: "+31%",
    width: "70%",
    up: true,
  },
  {
    name: "Studio Hindi",
    initial: "H",
    color: "var(--orb-d)",
    views: "54K",
    change: "+9%",
    width: "42%",
    up: true,
  },
  {
    name: "Studio Clips",
    initial: "C",
    color: "var(--orb-a)",
    views: "23K",
    change: "-4%",
    width: "20%",
    up: false,
  },
];

const weekdays = [
  { label: "Mon", height: 38 },
  { label: "Tue", height: 52 },
  { label: "Wed", height: 46 },
  { label: "Thu", height: 100 },
  { label: "Fri", height: 74 },
  { label: "Sat", height: 58 },
  { label: "Sun", height: 32 },
];

const traffic = [
  { label: "YouTube search", value: 38, color: "var(--orb-c)" },
  { label: "Suggested videos", value: 31, color: "var(--orb-a)" },
  { label: "Browse features", value: 19, color: "var(--orb-d)" },
  { label: "Other", value: 12, color: "var(--border-strong)" },
];

const plan = [
  { week: "Week 1", idea: "Beginner tutorial series kickoff" },
  { week: "Week 2", idea: "Answer the top viewer questions" },
  { week: "Week 3", idea: "Behind the scenes and a Short" },
  { week: "Week 4", idea: "Deep dive on your best performer" },
];

const cardClass =
  "reveal border-border bg-card/80 hover:border-border-strong hover:shadow-soft rounded-3xl border p-5 backdrop-blur-sm transition-[border-color,box-shadow] sm:p-7";

function CardTitle({ icon: Icon, title, hint }: { icon: LucideIcon; title: string; hint: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="bg-muted text-foreground grid size-10 shrink-0 place-items-center rounded-xl">
        <Icon className="size-[18px]" strokeWidth={1.7} aria-hidden />
      </span>
      <div>
        <h3 className="text-foreground text-base font-semibold tracking-tight">{title}</h3>
        <p className="text-muted-foreground text-[13px]">{hint}</p>
      </div>
    </div>
  );
}

export function GrowthTools() {
  return (
    <section id="grow" className="border-border bg-surface/40 scroll-mt-24 border-t">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-8 sm:py-20 lg:py-28">
        <div className="max-w-2xl">
          <span className="bg-muted text-foreground inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium">
            <TrendingUp className="size-3.5" aria-hidden />
            Grow faster
          </span>
          <h2 className="text-foreground mt-5 text-[30px] leading-tight font-medium tracking-tight sm:text-[34px] lg:text-[42px]">
            Grow every channel, not just the biggest one.
          </h2>
          <p className="text-body mt-4 text-lg">
            Compare channels side by side, find when your audience shows up, and turn the numbers
            into a plan you can publish from the same place.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:mt-14 sm:gap-5 lg:grid-cols-3">
          <article className={cn(cardClass, "lg:col-span-2")}>
            <CardTitle
              icon={BarChart3}
              title="All-channel comparison"
              hint="See which channels are rising and which need attention."
            />
            <ul className="mt-6 flex flex-col gap-4">
              {channelRows.map((row) => (
                <li key={row.name} className="flex items-center gap-3">
                  <span
                    className="grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: row.color }}
                    aria-hidden
                  >
                    {row.initial}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3 text-[13px]">
                      <span className="text-foreground truncate font-medium">{row.name}</span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className="text-body tabular-nums">{row.views}</span>
                        <span
                          className={cn(
                            "w-10 text-right text-xs font-medium tabular-nums",
                            row.up ? "text-success" : "text-danger",
                          )}
                        >
                          {row.change}
                        </span>
                      </span>
                    </div>
                    <div className="bg-muted mt-2 h-2 overflow-hidden rounded-full">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: row.width,
                          background: "linear-gradient(90deg, var(--orb-a), var(--orb-b))",
                        }}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </article>

          <article className={cardClass}>
            <CardTitle
              icon={CalendarDays}
              title="Best time to publish"
              hint="Performance by weekday."
            />
            <div className="mt-6 flex h-32 items-end gap-2">
              {weekdays.map((day) => (
                <div key={day.label} className="flex h-full flex-1 flex-col justify-end gap-2">
                  <div
                    className={cn("w-full rounded-t-lg", day.height === 100 ? "" : "bg-border")}
                    style={{
                      height: `${day.height}%`,
                      background:
                        day.height === 100
                          ? "linear-gradient(to top, var(--orb-b), var(--orb-a))"
                          : undefined,
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="text-muted-foreground mt-2 flex gap-2 text-[11px]">
              {weekdays.map((day) => (
                <span key={day.label} className="flex-1 text-center">
                  {day.label}
                </span>
              ))}
            </div>
            <p className="text-body mt-4 text-[13px] leading-relaxed">
              Thursday evening beats your channel average by 1.8x.
            </p>
          </article>

          <article className={cardClass}>
            <CardTitle icon={Search} title="Where viewers come from" hint="Traffic sources." />
            <div className="bg-muted mt-6 flex h-3 overflow-hidden rounded-full">
              {traffic.map((item) => (
                <div
                  key={item.label}
                  style={{ width: `${item.value}%`, backgroundColor: item.color }}
                />
              ))}
            </div>
            <ul className="mt-5 flex flex-col gap-2.5">
              {traffic.map((item) => (
                <li key={item.label} className="flex items-center justify-between text-[13px]">
                  <span className="text-body flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                      aria-hidden
                    />
                    {item.label}
                  </span>
                  <span className="text-foreground font-medium tabular-nums">{item.value}%</span>
                </li>
              ))}
            </ul>
          </article>

          <article className={cn(cardClass, "lg:col-span-2")}>
            <CardTitle
              icon={Sparkles}
              title="Your next 30 days, planned"
              hint="AI turns your data into a content plan."
            />
            <ol className="mt-6 grid gap-3 sm:grid-cols-2">
              {plan.map((item) => (
                <li
                  key={item.week}
                  className="bg-muted/70 flex items-center gap-3 rounded-2xl px-4 py-3.5"
                >
                  <span className="bg-primary text-primary-foreground grid size-7 shrink-0 place-items-center rounded-full">
                    <Check className="size-3.5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-muted-foreground text-[11px] font-medium">{item.week}</p>
                    <p className="text-foreground text-[13px] font-medium">{item.idea}</p>
                  </div>
                </li>
              ))}
            </ol>
          </article>
        </div>

        <p className="text-muted-foreground mt-6 text-center text-xs">
          Illustrations use sample data. Your reports use your own connected channels.
        </p>
      </div>
    </section>
  );
}