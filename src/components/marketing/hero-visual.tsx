import {
  ArrowUpRight,
  BarChart3,
  Check,
  Eye,
  Film,
  Heart,
  MessageCircle,
  Plus,
} from "lucide-react";
import { Orb } from "@/components/ui/orb";
import { cn } from "@/lib/utils";

interface Row {
  name: string;
  channel: string;
  fill: string;
  delay: string;
  steps: "plain" | "retry";
}

const rows: Row[] = [
  { name: "Main channel", channel: "Weekly Studio", fill: "100%", delay: "0s", steps: "plain" },
  { name: "Shorts", channel: "Studio Shorts", fill: "100%", delay: "-0.3s", steps: "plain" },
  { name: "Hindi", channel: "Studio Hindi", fill: "100%", delay: "-0.7s", steps: "retry" },
  { name: "Clips", channel: "Studio Clips", fill: "100%", delay: "-1.1s", steps: "plain" },
];

const channels = [
  { name: "Weekly Studio", initial: "W", color: "var(--orb-b)" },
  { name: "Studio Shorts", initial: "S", color: "var(--orb-c)" },
  { name: "Studio Hindi", initial: "H", color: "var(--orb-d)" },
  { name: "Studio Clips", initial: "C", color: "var(--orb-a)" },
];

function StatusLabel({ steps, delay }: { steps: Row["steps"]; delay: string }) {
  const style = { animationDelay: delay };
  return (
    <span className="relative inline-block h-5 w-20 text-right text-xs font-medium" aria-hidden>
      {steps === "plain" ? (
        <>
          <span className="demo-vis-a text-info absolute inset-0" style={style}>
            Uploading
          </span>
          <span className="demo-vis-b text-success absolute inset-0" style={style}>
            Published
          </span>
        </>
      ) : (
        <>
          <span className="demo-vis-a2 text-info absolute inset-0" style={style}>
            Uploading
          </span>
          <span className="demo-vis-m2 text-warning absolute inset-0" style={style}>
            Retrying
          </span>
          <span className="demo-vis-b text-success absolute inset-0" style={style}>
            Published
          </span>
        </>
      )}
    </span>
  );
}

export function HeroVisual({ className }: { className?: string }) {
  return (
    <div
      className={cn("relative w-full max-w-md", className)}
      role="img"
      aria-label="Illustration of connecting YouTube channels, publishing a video to four channels, and viewing sample performance analytics"
    >
      <Orb
        size="16rem"
        variant="sunset"
        blur
        className="animate-orb absolute -top-10 -right-8 opacity-60"
      />
      <Orb
        size="14rem"
        variant="lagoon"
        blur
        className="animate-orb-slow absolute -bottom-12 -left-10 opacity-50"
      />

      <div className="border-border bg-card/90 shadow-float relative overflow-hidden rounded-[28px] border p-5 backdrop-blur">
        <div className="flex items-center gap-4">
          <div className="relative grid aspect-video w-28 shrink-0 place-items-center overflow-hidden rounded-xl">
            <Orb
              size="100%"
              variant="bloom"
              className="absolute inset-0 !h-full !w-full rounded-none"
            />
            <Film className="relative size-6 text-white" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-foreground truncate text-sm font-medium">Weekly recap, episode 42</p>
            <p className="text-muted-foreground text-[13px]">MP4 · 38 MB · Public</p>
          </div>
        </div>

        <div className="demo-sequence mt-5">
          <div className="demo-connect-stage flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="bg-danger-soft text-danger grid size-8 place-items-center rounded-xl">
                  <Film className="size-4" aria-hidden />
                </div>
                <div>
                  <p className="text-foreground text-[13px] font-semibold">Connect your channels</p>
                  <p className="text-muted-foreground text-[11px]">One secure connection</p>
                </div>
              </div>
              <span className="bg-success-soft text-success inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium">
                <span className="demo-connect-pulse size-1.5 rounded-full bg-current" />
                All connected
              </span>
            </div>

            <ul className="flex flex-col gap-2">
              {channels.map((channel, index) => (
                <li
                  key={channel.name}
                  className="demo-channel-row bg-muted/70 flex items-center gap-3 rounded-2xl px-3 py-2.5"
                  style={{ ["--channel-index" as string]: index }}
                >
                  <span
                    className="grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: channel.color }}
                  >
                    {channel.initial}
                  </span>
                  <span className="text-foreground min-w-0 flex-1 truncate text-[13px] font-medium">
                    {channel.name}
                  </span>
                  <span className="text-success flex items-center gap-1.5 text-xs font-medium">
                    <Check className="demo-channel-check size-4" aria-hidden />
                    Connected
                  </span>
                </li>
              ))}
            </ul>

            <div className="border-border flex items-center justify-between rounded-xl border border-dashed px-3 py-2.5">
              <span className="text-muted-foreground flex items-center gap-2 text-xs">
                <span className="bg-muted grid size-7 place-items-center rounded-full">
                  <Plus className="size-3.5" aria-hidden />
                </span>
                Ready for your next channel
              </span>
              <ArrowUpRight className="text-muted-foreground size-4" aria-hidden />
            </div>
          </div>

          <div className="demo-upload-stage">
            <p className="text-muted-foreground mb-3 text-[13px]">Publishing to 4 channels</p>

            <ul className="flex flex-col gap-3.5">
              {rows.map((row) => (
                <li
                  key={row.name}
                  className="bg-muted/70 flex flex-col gap-2 rounded-2xl px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-foreground truncate text-[13px] font-medium">
                        {row.name}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">{row.channel}</p>
                    </div>
                    <StatusLabel steps={row.steps} delay={row.delay} />
                  </div>
                  <div className="bg-border h-1.5 overflow-hidden rounded-full">
                    <div
                      className="demo-bar bg-foreground h-full rounded-full"
                      style={{ ["--fill" as string]: row.fill, animationDelay: row.delay }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="demo-analytics-stage flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="text-muted-foreground size-4" aria-hidden />
                <p className="text-foreground text-[13px] font-semibold">Performance overview</p>
              </div>
              <span className="bg-success-soft text-success inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium">
                <Check className="size-3" aria-hidden />
                Published
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-muted/70 rounded-xl px-3 py-3">
                <div className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                  <Eye className="size-3.5" aria-hidden />
                  Views
                </div>
                <p className="text-foreground mt-1 text-lg font-semibold tracking-tight">
                  <span
                    className="demo-metric-count"
                    style={{ ["--metric-target" as string]: 12800 }}
                    aria-label="12,800"
                  />
                </p>
                <p className="text-success text-[11px] font-medium">+18.6%</p>
              </div>
              <div className="bg-muted/70 rounded-xl px-3 py-3">
                <div className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                  <Heart className="size-3.5" aria-hidden />
                  Likes
                </div>
                <p className="text-foreground mt-1 text-lg font-semibold tracking-tight">
                  <span
                    className="demo-metric-count"
                    style={{ ["--metric-target" as string]: 842 }}
                    aria-label="842"
                  />
                </p>
                <p className="text-success text-[11px] font-medium">+12.3%</p>
              </div>
              <div className="bg-muted/70 rounded-xl px-3 py-3">
                <div className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                  <MessageCircle className="size-3.5" aria-hidden />
                  Comments
                </div>
                <p className="text-foreground mt-1 text-lg font-semibold tracking-tight">
                  <span
                    className="demo-metric-count"
                    style={{ ["--metric-target" as string]: 96 }}
                    aria-label="96"
                  />
                </p>
                <p className="text-success text-[11px] font-medium">+8.4%</p>
              </div>
            </div>

            <div className="bg-muted/70 flex items-end justify-between gap-1 rounded-xl px-4 pt-3 pb-2">
              {[34, 48, 39, 67, 54, 82, 100].map((height, index) => (
                <div key={height} className="flex h-12 flex-1 items-end justify-center">
                  <div
                    className={cn(
                      "demo-chart-bar w-full max-w-5 rounded-t-md opacity-80",
                      index === 6 && "opacity-100",
                    )}
                    style={{
                      ["--chart-index" as string]: index,
                      height: `${height}%`,
                      background: "linear-gradient(to top, var(--orb-b), var(--orb-a))",
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-muted-foreground text-xs">Across 4 connected channels</p>
              <span className="bg-foreground text-background inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium">
                Manage video
                <ArrowUpRight className="size-3.5" aria-hidden />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
