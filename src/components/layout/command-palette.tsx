"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CornerDownLeft,
  FileSearch,
  FolderOpen,
  History,
  House,
  MonitorPlay,
  Plus,
  RotateCcw,
  Search,
  Send,
  Settings,
  Upload,
  type LucideIcon,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Command {
  id: string;
  label: string;
  hint?: string;
  href: string;
  icon: LucideIcon;
  keywords?: string;
}

const staticCommands: Command[] = [
  { id: "home", label: "Home", href: "/dashboard", icon: House, keywords: "dashboard overview" },
  {
    id: "accounts",
    label: "YouTube Accounts",
    href: "/accounts",
    icon: MonitorPlay,
    keywords: "channels connected",
  },
  {
    id: "storage",
    label: "Storage",
    href: "/storage",
    icon: FolderOpen,
    keywords: "library files videos images",
  },
  {
    id: "publish",
    label: "Publish a video",
    href: "/uploads/new",
    icon: Send,
    keywords: "upload new channels",
  },
  {
    id: "history",
    label: "Upload History",
    href: "/uploads",
    icon: History,
    keywords: "jobs past",
  },
  {
    id: "connect",
    label: "Connect a YouTube account",
    href: "/accounts?connect=1",
    icon: Plus,
    keywords: "add channel google",
  },
  {
    id: "upload-files",
    label: "Upload files to Storage",
    href: "/storage?upload=1",
    icon: Upload,
    keywords: "add video image",
  },
  {
    id: "failed",
    label: "Show failed uploads",
    href: "/uploads?status=failed",
    icon: RotateCcw,
    keywords: "retry errors",
  },
  {
    id: "settings",
    label: "Settings",
    href: "/settings",
    icon: Settings,
    keywords: "profile theme logout",
  },
];

function PaletteBody({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [index, setIndex] = React.useState(0);

  const results = React.useMemo<Command[]>(() => {
    const term = query.trim();
    const lower = term.toLowerCase();
    const filtered = lower
      ? staticCommands.filter((command) =>
          `${command.label} ${command.keywords ?? ""}`.toLowerCase().includes(lower),
        )
      : staticCommands;
    if (!term) return filtered;
    const encoded = encodeURIComponent(term);
    return [
      ...filtered,
      {
        id: "search-storage",
        label: `Search Storage for “${term}”`,
        href: `/storage?search=${encoded}`,
        icon: FileSearch,
      },
      {
        id: "search-history",
        label: `Search Upload History for “${term}”`,
        href: `/uploads?search=${encoded}`,
        icon: Search,
      },
    ];
  }, [query]);

  function go(command: Command | undefined) {
    if (!command) return;
    onClose();
    router.push(command.href);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIndex((value) => Math.min(value + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setIndex((value) => Math.max(value - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(results[index]);
    }
  }

  return (
    <div onKeyDown={onKeyDown}>
      <DialogTitle className="sr-only">Search</DialogTitle>
      <DialogDescription className="sr-only">Search pages and actions</DialogDescription>
      <div className="border-border flex items-center gap-3 border-b px-5">
        <Search className="text-muted-foreground size-4 shrink-0" aria-hidden />
        <input
          autoFocus
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIndex(0);
          }}
          placeholder="Search pages, actions, files and uploads"
          aria-label="Search"
          className="text-foreground placeholder:text-muted-foreground h-14 w-full bg-transparent text-[15px] outline-none"
        />
      </div>
      <ul
        role="listbox"
        aria-label="Results"
        className="max-h-80 scrollbar-thin overflow-y-auto p-2"
      >
        {results.map((command, position) => {
          const Icon = command.icon;
          const active = position === index;
          return (
            <li key={command.id} role="option" aria-selected={active}>
              <button
                type="button"
                onMouseMove={() => setIndex(position)}
                onClick={() => go(command)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm",
                  active ? "bg-muted text-foreground" : "text-body",
                )}
              >
                <Icon className="text-muted-foreground size-4 shrink-0" aria-hidden />
                <span className="truncate">{command.label}</span>
                {active ? (
                  <CornerDownLeft className="text-muted-foreground ml-auto size-3.5" aria-hidden />
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" hideClose className="top-[20%] translate-y-0 overflow-hidden p-0">
        <PaletteBody onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
