import * as React from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const tones = {
  info: { classes: "bg-info-soft text-info", icon: Info },
  success: { classes: "bg-success-soft text-success", icon: CircleCheck },
  warning: { classes: "bg-warning-soft text-warning", icon: TriangleAlert },
  danger: { classes: "bg-danger-soft text-danger", icon: CircleAlert },
} as const;

interface AlertProps {
  tone?: keyof typeof tones;
  title?: string;
  children?: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function Alert({ tone = "info", title, children, className, action }: AlertProps) {
  const { classes, icon: Icon } = tones[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn("flex items-start gap-3 rounded-2xl px-4 py-3.5 text-sm", classes, className)}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        {title ? <p className="font-medium">{title}</p> : null}
        {children ? (
          <div className={cn(title && "mt-0.5", "text-[13px] opacity-90")}>{children}</div>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
