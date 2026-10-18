"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getAccountStatus, isAccountUsable } from "@/features/accounts/status";
import { cn } from "@/lib/utils";
import type { YouTubeAccount } from "@/types/api";

interface ChannelPickerProps {
  accounts: YouTubeAccount[];
  loading: boolean;
  value: string[];
  onChange: (ids: string[]) => void;
}

export function ChannelPicker({ accounts, loading, value, onChange }: ChannelPickerProps) {
  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="bg-muted flex flex-col items-start gap-3 rounded-2xl px-5 py-5">
        <p className="text-body text-sm">No YouTube accounts are connected yet.</p>
        <Button asChild size="sm">
          <Link href="/accounts?connect=1">
            <Plus /> Connect account
          </Link>
        </Button>
      </div>
    );
  }

  const usable = accounts.filter(isAccountUsable);
  const allSelected = usable.length > 0 && usable.every((account) => value.includes(account.id));

  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((item) => item !== id) : [...value, id]);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {value.length} of {usable.length} available selected
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(allSelected ? [] : usable.map((account) => account.id))}
          disabled={usable.length === 0}
        >
          {allSelected ? "Clear selection" : "Select all"}
        </Button>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {accounts.map((account) => {
          const usableAccount = isAccountUsable(account);
          const selected = value.includes(account.id);
          const status = getAccountStatus(account);
          return (
            <li key={account.id}>
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-3.5 rounded-2xl border p-3.5 transition-colors",
                  selected
                    ? "border-foreground bg-muted/60"
                    : "border-border hover:border-border-strong",
                  !usableAccount && "hover:border-border cursor-not-allowed opacity-60",
                )}
              >
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={selected}
                  disabled={!usableAccount}
                  onChange={() => toggle(account.id)}
                />
                <span
                  aria-hidden
                  className={cn(
                    "border-border-strong text-primary-foreground peer-focus-visible:outline-ring grid size-5 shrink-0 place-items-center rounded-md border peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2",
                    selected && "border-foreground bg-foreground",
                  )}
                >
                  {selected ? (
                    <svg
                      viewBox="0 0 16 16"
                      className="size-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m3.5 8.5 3 3 6-7" />
                    </svg>
                  ) : null}
                </span>
                <Avatar
                  src={account.channel_thumbnail_url}
                  name={account.channel_title}
                  size={40}
                />
                <span className="min-w-0 flex-1">
                  <span className="text-foreground block truncate text-sm font-medium">
                    {account.nickname}
                  </span>
                  <span className="text-muted-foreground block truncate text-[13px]">
                    {account.channel_title}
                  </span>
                </span>
                {!usableAccount ? <Badge tone={status.tone}>{status.label}</Badge> : null}
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
