import { Film } from "lucide-react";
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
  { name: "Shorts", channel: "Studio Shorts", fill: "100%", delay: "-1.4s", steps: "plain" },
  { name: "Hindi", channel: "Studio Hindi", fill: "100%", delay: "-3.1s", steps: "retry" },
  { name: "Clips", channel: "Studio Clips", fill: "100%", delay: "-4.6s", steps: "plain" },
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
      aria-label="Illustration of one video being published to four YouTube channels at once, with live progress for each channel"
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

        <p className="text-muted-foreground mt-5 mb-3 text-[13px]">Publishing to 4 channels</p>

        <ul className="flex flex-col gap-3.5">
          {rows.map((row) => (
            <li key={row.name} className="bg-muted/70 flex flex-col gap-2 rounded-2xl px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-foreground truncate text-[13px] font-medium">{row.name}</p>
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
    </div>
  );
}
