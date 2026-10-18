import * as React from "react";
import { Orb } from "@/components/ui/orb";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "sunset" | "lagoon" | "bloom" | "meadow";
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  variant = "sunset",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "border-border-strong flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed px-6 py-16 text-center",
        className,
      )}
    >
      <Orb size={56} variant={variant} />
      <div className="max-w-sm">
        <h3 className="text-foreground text-base font-semibold">{title}</h3>
        {description ? <p className="text-muted-foreground mt-1.5 text-sm">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
