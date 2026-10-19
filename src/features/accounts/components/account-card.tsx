"use client";

import { ExternalLink, Ellipsis, Pencil, PlugZap, RefreshCw, Unplug } from "lucide-react";
import { AccountStatusBadge } from "@/features/accounts/components/account-status-badge";
import { channelUrl } from "@/features/accounts/status";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate, formatRelative } from "@/lib/format";
import type { YouTubeAccount } from "@/types/api";

interface AccountCardProps {
  account: YouTubeAccount;
  onEdit: (account: YouTubeAccount) => void;
  onReconnect: (account: YouTubeAccount) => void;
  onDisconnect: (account: YouTubeAccount) => void;
  onRefresh: (account: YouTubeAccount) => void;
  refreshing?: boolean;
}

export function AccountCard({
  account,
  onEdit,
  onReconnect,
  onDisconnect,
  onRefresh,
  refreshing,
}: AccountCardProps) {
  return (
    <Card className="flex flex-col p-4 sm:p-6">
      <div className="flex items-start gap-4">
        <Avatar src={account.channel_thumbnail_url} name={account.channel_title} size={52} />
        <div className="min-w-0 flex-1">
          <h3 className="text-foreground truncate text-base font-semibold">
            {account.channel_title}
          </h3>
          <p className="text-muted-foreground truncate text-[13px]">{account.nickname}</p>
          <div className="mt-2">
            <AccountStatusBadge account={account} />
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              shape="rounded"
              aria-label={`Actions for ${account.nickname}`}
            >
              <Ellipsis />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => onEdit(account)}>
              <Pencil /> Edit details
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onRefresh(account)}>
              <RefreshCw /> Refresh from Google
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onReconnect(account)}>
              <PlugZap /> Reconnect
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={channelUrl(account.channel_id)} target="_blank" rel="noopener noreferrer">
                <ExternalLink /> Open on YouTube
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onSelect={() => onDisconnect(account)}>
              <Unplug /> Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {account.needs_reconnect ? (
        <div className="bg-warning-soft text-warning mt-5 flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-[13px]">
          <span>Permission was revoked or expired. Reconnect to publish again.</span>
          <Button size="sm" variant="outline" onClick={() => onReconnect(account)}>
            Reconnect
          </Button>
        </div>
      ) : null}

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <div className="col-span-2 min-w-0">
          <dt className="text-muted-foreground text-[13px]">Google account</dt>
          <dd className="text-foreground truncate">{account.google_email ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-[13px]">Last used</dt>
          <dd className="text-foreground">
            {account.last_used_at ? formatRelative(account.last_used_at) : "Never"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-[13px]">Connected</dt>
          <dd className="text-foreground">{formatDate(account.created_at)}</dd>
        </div>
      </dl>

      {account.notes ? (
        <p className="bg-muted text-body mt-4 line-clamp-2 rounded-xl px-3.5 py-2.5 text-[13px]">
          {account.notes}
        </p>
      ) : null}

      {refreshing ? <p className="text-muted-foreground mt-3 text-[13px]">Refreshing…</p> : null}
    </Card>
  );
}
