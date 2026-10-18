"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { controlClasses, useFieldControl } from "@/components/ui/field";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  maxTagLength?: number;
  maxTags?: number;
  placeholder?: string;
  className?: string;
}

export function TagInput({
  value,
  onChange,
  maxTagLength = 30,
  maxTags = 100,
  placeholder = "Type a tag and press Enter",
  className,
}: TagInputProps) {
  const [draft, setDraft] = React.useState("");
  const control = useFieldControl();

  const commit = React.useCallback(
    (raw: string) => {
      const parts = raw
        .split(",")
        .map((part) => part.trim().replace(/\s+/g, " "))
        .filter(Boolean)
        .map((part) => part.slice(0, maxTagLength));
      if (parts.length === 0) return;
      const next = [...value];
      for (const part of parts) {
        const exists = next.some((tag) => tag.toLowerCase() === part.toLowerCase());
        if (!exists && next.length < maxTags) next.push(part);
      }
      onChange(next);
      setDraft("");
    },
    [maxTagLength, maxTags, onChange, value],
  );

  return (
    <div
      className={cn(
        controlClasses,
        "focus-within:border-foreground focus-within:ring-foreground/10 flex min-h-11 flex-wrap items-center gap-1.5 py-1.5 focus-within:ring-4",
        className,
      )}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="bg-muted text-foreground inline-flex items-center gap-1 rounded-full py-1 pr-1.5 pl-3 text-[13px]"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((item) => item !== tag))}
            className="text-muted-foreground hover:bg-border hover:text-foreground grid size-4 place-items-center rounded-full"
            aria-label={`Remove ${tag}`}
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        {...control}
        value={draft}
        onChange={(event) => {
          const next = event.target.value;
          if (next.includes(",")) commit(next);
          else setDraft(next);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit(draft);
          } else if (event.key === "Backspace" && draft === "" && value.length > 0) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={() => commit(draft)}
        placeholder={value.length === 0 ? placeholder : ""}
        className="placeholder:text-muted-foreground min-w-32 flex-1 bg-transparent py-1 text-sm outline-none"
      />
    </div>
  );
}
