import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("bg-muted relative overflow-hidden rounded-xl", className)}>
      <div className="shimmer absolute inset-0" />
    </div>
  );
}
