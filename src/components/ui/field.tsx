"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface FieldContextValue {
  id: string;
  describedBy?: string;
  invalid: boolean;
}

const FieldContext = React.createContext<FieldContextValue | null>(null);

export function useFieldControl() {
  const context = React.useContext(FieldContext);
  if (!context) return {};
  return {
    id: context.id,
    "aria-describedby": context.describedBy,
    "aria-invalid": context.invalid || undefined,
  };
}

interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function Field({
  label,
  hint,
  error,
  required,
  optional,
  action,
  className,
  children,
}: FieldProps) {
  const id = React.useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ");

  return (
    <FieldContext.Provider
      value={{ id, describedBy: describedBy || undefined, invalid: Boolean(error) }}
    >
      <div className={cn("flex flex-col gap-1.5", className)}>
        {label ? (
          <div className="flex items-center justify-between gap-3">
            <label htmlFor={id} className="text-foreground text-sm font-medium">
              {label}
              {required ? (
                <span className="text-muted-foreground" aria-hidden>
                  {" "}
                  *
                </span>
              ) : null}
              {optional ? (
                <span className="text-muted-foreground ml-1.5 text-xs font-normal">Optional</span>
              ) : null}
            </label>
            {action}
          </div>
        ) : null}
        {children}
        {hint && !error ? (
          <p id={hintId} className="text-muted-foreground text-[13px]">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} role="alert" className="text-danger text-[13px]">
            {error}
          </p>
        ) : null}
      </div>
    </FieldContext.Provider>
  );
}

export const controlClasses =
  "w-full rounded-xl border border-border-strong bg-background px-3.5 text-base text-foreground placeholder:text-muted-foreground transition-colors hover:border-foreground/40 focus-visible:border-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-foreground/10 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger/15 lg:text-sm";
