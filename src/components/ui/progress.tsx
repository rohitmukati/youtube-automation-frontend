import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  tone?: "default" | "success" | "danger" | "warning";
  className?: string;
  label?: string;
}

const tones = {
  default: "bg-foreground",
  success: "bg-success",
  danger: "bg-danger",
  warning: "bg-warning",
} as const;

export function Progress({ value, tone = "default", className, label }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      aria-label={label}
      className={cn("bg-muted h-1.5 w-full overflow-hidden rounded-full", className)}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500 ease-out", tones[tone])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
