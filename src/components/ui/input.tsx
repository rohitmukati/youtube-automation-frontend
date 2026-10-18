"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { controlClasses, useFieldControl } from "@/components/ui/field";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  const control = useFieldControl();
  return (
    <input ref={ref} className={cn(controlClasses, "h-11", className)} {...control} {...props} />
  );
});

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  const control = useFieldControl();
  return (
    <textarea
      ref={ref}
      className={cn(controlClasses, "min-h-28 resize-y py-3 leading-relaxed", className)}
      {...control}
      {...props}
    />
  );
});

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">
>(function PasswordInput({ className, ...props }, ref) {
  const [visible, setVisible] = React.useState(false);
  const control = useFieldControl();
  return (
    <div className="relative">
      <input
        ref={ref}
        type={visible ? "text" : "password"}
        className={cn(controlClasses, "h-11 pr-11", className)}
        {...control}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        className="text-muted-foreground hover:bg-muted hover:text-foreground absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-lg"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
});

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, children, ...props }, ref) {
  const control = useFieldControl();
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(controlClasses, "h-11 cursor-pointer appearance-none pr-10", className)}
        {...control}
        {...props}
      >
        {children}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        className="text-muted-foreground pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m5 7.5 5 5 5-5" />
      </svg>
    </div>
  );
});

export const Checkbox = React.forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">
>(function Checkbox({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      type="checkbox"
      className={cn(
        "border-border-strong size-[18px] shrink-0 cursor-pointer rounded-md border accent-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});
