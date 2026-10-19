"use client";

import * as React from "react";
import { Card, CardBody } from "@/components/ui/card";
import { Orb } from "@/components/ui/orb";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuota } from "@/features/uploads/hooks";

export function QuotaCard() {
  const { data, isLoading, isError, refetch } = useQuota();
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const resetAt = data ? Date.parse(data.resets_at) : Number.NaN;
  const secondsRemaining = Number.isFinite(resetAt)
    ? Math.max(0, Math.ceil((resetAt - now) / 1000))
    : null;

  React.useEffect(() => {
    if (secondsRemaining === 0) void refetch();
  }, [refetch, secondsRemaining]);

  const countdown =
    secondsRemaining === null
      ? "Reset time unavailable"
      : secondsRemaining === 0
        ? "Resetting now"
        : formatCountdown(secondsRemaining);

  return (
    <Card className="relative overflow-hidden">
      <Orb
        size="12rem"
        variant="sunset"
        blur
        className="absolute -right-16 -bottom-20 opacity-40"
      />
      <CardBody className="relative flex h-full flex-col gap-5">
        <div>
          <h2 className="text-foreground text-base font-semibold tracking-tight">
            Today&rsquo;s upload limit
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Shared across every channel you publish to.
          </p>
        </div>

        {isLoading ? <Skeleton className="h-28" /> : null}
        {isError ? (
          <p className="text-muted-foreground text-sm">The limit could not be loaded right now.</p>
        ) : null}

        {data ? (
          <>
            <div>
              <p className="text-foreground text-4xl font-medium tracking-tight tabular-nums">
                {data.remaining}
              </p>
              <p className="text-muted-foreground text-sm">uploads left today</p>
            </div>
            <Progress
              value={data.daily_limit > 0 ? (data.used_today / data.daily_limit) * 100 : 0}
              tone={data.remaining === 0 ? "danger" : "default"}
              label="Daily upload usage"
            />
            <dl className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground text-[13px]">Used</dt>
                <dd className="text-foreground font-medium tabular-nums">{data.used_today}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-[13px]">Waiting</dt>
                <dd className="text-foreground font-medium tabular-nums">{data.waiting}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-[13px]">Limit</dt>
                <dd className="text-foreground font-medium tabular-nums">{data.daily_limit}</dd>
              </div>
            </dl>
            <p className="text-muted-foreground text-[13px]" aria-live="off">
              Resets in{" "}
              <span className="text-foreground font-medium tabular-nums">{countdown}</span>
            </p>
          </>
        ) : null}
      </CardBody>
    </Card>
  );
}

function formatCountdown(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours > 0 ? `${hours}h ` : ""}${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
}
