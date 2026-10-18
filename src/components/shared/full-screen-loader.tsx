import { Orb } from "@/components/ui/orb";

export function FullScreenLoader({ label = "Loading your workspace" }: { label?: string }) {
  return (
    <div
      className="bg-background grid min-h-dvh place-items-center"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <Orb size={44} className="animate-pulse-dot" />
        <p className="text-muted-foreground text-sm">{label}</p>
      </div>
    </div>
  );
}
