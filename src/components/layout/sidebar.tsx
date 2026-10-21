"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, LogOut, Plus } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { channelNav, primaryNav, type NavItem } from "@/config/navigation";
import { useAccounts } from "@/features/accounts/hooks";
import { useSession } from "@/features/auth/session-provider";
import { useQuota } from "@/features/uploads/hooks";
import { cn } from "@/lib/utils";

function NavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const active = item.match ? item.match(pathname) : pathname === item.href;
  const Icon = item.icon;
  return (
    <div className="group relative">
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex h-10 items-center gap-3 rounded-xl px-3 text-[15px] transition-colors",
          active
            ? "bg-muted text-foreground font-medium"
            : "text-body hover:bg-muted/70 hover:text-foreground",
        )}
      >
        <Icon className="size-5 shrink-0" strokeWidth={1.6} aria-hidden />
        <span className="truncate">{item.label}</span>
      </Link>
      {item.quickAction ? (
        <Link
          href={item.quickAction.href}
          onClick={onNavigate}
          aria-label={item.quickAction.label}
          className="text-muted-foreground hover:bg-border hover:text-foreground absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-lg transition-colors"
        >
          <Plus className="size-4" />
        </Link>
      ) : null}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground px-3 pt-5 pb-2 text-[13px]">{children}</p>;
}

function ConnectedAccounts({ onNavigate }: { onNavigate?: () => void }) {
  const { data, isLoading } = useAccounts();
  const accounts = data?.accounts ?? [];
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 px-3">
        <Skeleton className="h-6" />
        <Skeleton className="h-6" />
      </div>
    );
  }
  return (
    <>
      <SectionLabel>Connected accounts</SectionLabel>
      <Link
        href="/analytics"
        onClick={onNavigate}
        aria-current={pathname === "/analytics" ? "page" : undefined}
        className={cn(
          "mb-1 flex h-10 items-center gap-3 rounded-xl px-3 text-[15px] transition-colors",
          pathname === "/analytics"
            ? "bg-muted text-foreground font-medium"
            : "text-body hover:bg-muted/70 hover:text-foreground",
        )}
      >
        <BarChart3 className="size-5 shrink-0" strokeWidth={1.6} aria-hidden />
        <span className="truncate">All channels</span>
      </Link>
      <ul className="flex flex-col">
        {accounts.map((account) => {
          const href = `/accounts/${account.id}`;
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={account.id}>
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-xl px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-muted text-foreground font-medium"
                    : "text-body hover:bg-muted/70 hover:text-foreground",
                )}
              >
                <Avatar
                  src={account.channel_thumbnail_url}
                  name={account.channel_title}
                  size={22}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{account.channel_title}</span>
                  <span className="text-muted-foreground block truncate text-xs">
                    {account.nickname}
                  </span>
                </span>
                {account.needs_reconnect || !account.is_active ? (
                  <span
                    className="bg-warning ml-auto size-2 shrink-0 rounded-full"
                    title="Needs attention"
                  />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function QuotaMeter() {
  const { data } = useQuota();
  if (!data) return null;
  const percent = data.daily_limit > 0 ? (data.remaining / data.daily_limit) * 100 : 0;
  return (
    <div className="border-border mx-3 mb-3 rounded-2xl border p-3.5">
      <div className="flex items-baseline justify-between text-[13px]">
        <span className="text-muted-foreground">Uploads left today</span>
        <span className="text-foreground font-medium">
          {data.remaining} / {data.daily_limit}
        </span>
      </div>
      <Progress
        className="mt-2.5 isolate [clip-path:inset(0_round_9999px)]"
        value={percent}
        tone={percent <= 10 ? "danger" : percent <= 30 ? "warning" : "default"}
        label="Daily uploads remaining"
      />
    </div>
  );
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useSession();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-16 shrink-0 items-center px-5">
        <Logo href="/dashboard" />
      </div>

      <nav aria-label="Main" className="min-h-0 flex-1 scrollbar-thin overflow-y-auto px-3 pb-3">
        <div className="flex flex-col gap-0.5">
          {primaryNav.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} onNavigate={onNavigate} />
          ))}
        </div>

        <SectionLabel>Channel Management</SectionLabel>
        <div className="flex flex-col gap-0.5">
          {channelNav.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} onNavigate={onNavigate} />
          ))}
        </div>

        <ConnectedAccounts onNavigate={onNavigate} />
      </nav>

      <div className="border-border shrink-0 border-t pt-3">
        <QuotaMeter />
        <div className="px-3 pb-3">
          <Link
            href="/settings"
            onClick={onNavigate}
            className="hover:bg-muted/70 flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors"
          >
            <Avatar name={user.name} size={36} />
            <span className="min-w-0">
              <span className="text-foreground block truncate text-sm font-medium">
                {user.name}
              </span>
              <span className="text-muted-foreground block truncate text-[13px]">{user.email}</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => void logout()}
            className="text-body hover:bg-muted/70 hover:text-foreground mt-0.5 flex h-10 w-full items-center gap-3 rounded-xl px-3 text-[15px] transition-colors"
          >
            <LogOut className="size-5" strokeWidth={1.6} aria-hidden />
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}