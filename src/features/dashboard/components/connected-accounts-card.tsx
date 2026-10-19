"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountStatusBadge } from "@/features/accounts/components/account-status-badge";
import { useAccounts } from "@/features/accounts/hooks";

export function ConnectedAccountsCard() {
  const { data, isLoading, isError, isFetching, refetch } = useAccounts();
  const accounts = data?.accounts ?? [];

  return (
    <Card className="lg:col-span-2">
      <CardHeader
        title="Connected accounts"
        description={data ? `${data.total} connected` : undefined}
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/accounts">Manage</Link>
          </Button>
        }
      />
      <CardBody className="pt-4">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : null}

        {!isLoading && isError && accounts.length === 0 ? (
          <div className="bg-muted flex flex-col items-start gap-3 rounded-2xl px-5 py-5">
            <p className="text-body text-sm">
              Connected accounts could not be loaded. Check your connection and try again.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={isFetching}
              onClick={() => void refetch()}
            >
              Try again
            </Button>
          </div>
        ) : null}

        {!isLoading && !isError && accounts.length === 0 ? (
          <div className="bg-muted flex flex-col items-start gap-3 rounded-2xl px-5 py-5">
            <p className="text-body text-sm">Connect a YouTube account to start publishing.</p>
            <Button asChild size="sm">
              <Link href="/accounts?connect=1">
                <Plus /> Connect account
              </Link>
            </Button>
          </div>
        ) : null}

        {accounts.length > 0 ? (
          <ul className="divide-border divide-y">
            {accounts.slice(0, 5).map((account) => (
              <li key={account.id} className="flex items-center gap-3.5 py-3 first:pt-0 last:pb-0">
                <Avatar
                  src={account.channel_thumbnail_url}
                  name={account.channel_title}
                  size={40}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate text-sm font-medium">
                    {account.channel_title}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">{account.nickname}</p>
                </div>
                <AccountStatusBadge account={account} />
              </li>
            ))}
          </ul>
        ) : null}
      </CardBody>
    </Card>
  );
}
