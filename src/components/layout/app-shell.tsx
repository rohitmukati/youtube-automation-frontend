"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { AppBanner } from "@/components/layout/app-banner";
import { CommandPalette } from "@/components/layout/command-palette";
import { SidebarContent } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Dialog, DialogDescription, DialogTitle, SheetContent } from "@/components/ui/dialog";
import { useSidebarCollapsed } from "@/hooks/use-sidebar-preference";

function useMediaQuery(query: string): boolean {
  return React.useSyncExternalStore(
    (notify) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", notify);
      return () => media.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => true,
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [collapsed, setCollapsed] = useSidebarCollapsed();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [lastPath, setLastPath] = React.useState(pathname);

  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMobileOpen(false);
  }

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((value) => !value);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const toggleSidebar = () => {
    if (isDesktop) setCollapsed(!collapsed);
    else setMobileOpen((value) => !value);
  };

  const sidebarOpen = isDesktop ? !collapsed : mobileOpen;

  return (
    <div className="bg-background flex min-h-dvh">
      <a
        href="#main"
        className="focus:bg-foreground focus:text-background sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:px-4 focus:py-2"
      >
        Skip to content
      </a>

      {isDesktop && !collapsed ? (
        <aside className="border-border bg-background sticky top-0 hidden h-dvh w-[17rem] shrink-0 border-r lg:block">
          <SidebarContent />
        </aside>
      ) : null}

      <Dialog open={!isDesktop && mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent>
          <DialogTitle className="sr-only">Navigation</DialogTitle>
          <DialogDescription className="sr-only">Main navigation menu</DialogDescription>
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Dialog>

      <div className="flex min-w-0 flex-1 flex-col">
        <AppBanner />
        <Topbar
          onToggleSidebar={toggleSidebar}
          onOpenSearch={() => setSearchOpen(true)}
          sidebarOpen={sidebarOpen}
        />
        <main id="main" className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-8 sm:px-8 sm:py-10">
          {children}
        </main>
      </div>

      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
