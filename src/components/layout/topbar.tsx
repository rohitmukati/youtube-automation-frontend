"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeft, Search, Send } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { resolveTitle } from "@/config/navigation";

interface TopbarProps {
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
  sidebarOpen: boolean;
}

export function Topbar({ onToggleSidebar, onOpenSearch, sidebarOpen }: TopbarProps) {
  const pathname = usePathname();
  const title = resolveTitle(pathname);

  return (
    <header className="border-border bg-background/90 sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b px-4 backdrop-blur sm:px-6">
      <Tooltip content={sidebarOpen ? "Hide sidebar" : "Show sidebar"}>
        <Button
          variant="ghost"
          size="icon-sm"
          shape="rounded"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          aria-expanded={sidebarOpen}
        >
          <PanelLeft />
        </Button>
      </Tooltip>

      <p className="text-foreground hidden min-w-24 text-[15px] font-medium sm:block">{title}</p>

      <button
        type="button"
        onClick={onOpenSearch}
        className="border-border text-muted-foreground hover:border-border-strong hover:bg-muted/60 mx-auto flex h-10 w-full max-w-sm items-center gap-2.5 rounded-xl border px-3.5 text-sm transition-colors"
        aria-label="Search everything"
      >
        <Search className="size-4 shrink-0" aria-hidden />
        <span className="flex-1 truncate text-left">Search everything...</span>
        <kbd className="border-border hidden rounded-md border px-1.5 py-0.5 text-[11px] font-medium sm:block">
          ⌘K
        </kbd>
      </button>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button asChild size="sm" className="hidden sm:inline-flex">
          <Link href="/uploads/new">
            <Send /> Publish
          </Link>
        </Button>
      </div>
    </header>
  );
}
