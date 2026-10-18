import * as React from "react";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Orb } from "@/components/ui/orb";
import { siteConfig } from "@/config/site";

interface AuthShellProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthShell({ title, description, children, footer }: AuthShellProps) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="flex min-h-dvh flex-col px-6 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>

        <main
          id="main"
          className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-12"
        >
          <h1 className="text-foreground text-[32px] leading-tight font-medium tracking-tight">
            {title}
          </h1>
          {description ? (
            <p className="text-muted-foreground mt-2 text-[15px]">{description}</p>
          ) : null}
          <div className="mt-8">{children}</div>
          {footer ? (
            <div className="text-muted-foreground mt-8 text-center text-sm">{footer}</div>
          ) : null}
        </main>

        <p className="text-muted-foreground text-center text-xs">
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
      </div>

      <aside
        aria-hidden
        className="border-border bg-surface relative hidden overflow-hidden border-l lg:block"
      >
        <div className="absolute inset-0">
          <Orb
            size="34rem"
            variant="sunset"
            blur
            className="animate-orb absolute -top-24 -right-24 opacity-60"
          />
          <Orb
            size="30rem"
            variant="lagoon"
            blur
            className="animate-orb-slow absolute -bottom-32 -left-20 opacity-50"
          />
          <Orb
            size="20rem"
            variant="bloom"
            blur
            className="animate-orb absolute top-1/3 left-1/3 opacity-40"
          />
        </div>
        <div className="relative flex h-full flex-col justify-end p-14">
          <p className="text-foreground max-w-md text-[34px] leading-[1.15] font-medium tracking-tight">
            Publish once. Be live on every channel you manage.
          </p>
          <p className="text-body mt-4 max-w-sm text-[15px]">
            Connect your YouTube accounts, keep your media in one place, and follow every upload as
            it happens.
          </p>
        </div>
      </aside>
    </div>
  );
}
