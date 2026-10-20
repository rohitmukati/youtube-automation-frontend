"use client";

import type { ReactNode } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage, toApiError } from "@/lib/api/errors";
import type { AvailableRows } from "@/types/api";

export function AnalyticsSection({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={`p-4 sm:p-6 ${className}`}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-foreground text-base font-semibold">{title}</h2>
          {description ? <p className="text-muted-foreground mt-1 text-sm">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}

export function AnalyticsLoading({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3" aria-label="Loading analytics">
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-12 rounded-xl" />
      ))}
    </div>
  );
}

export function AnalyticsError({
  error,
  retry,
  onReconnect,
  onOAuthSettings,
}: {
  error: unknown;
  retry: () => void;
  onReconnect?: () => void;
  onOAuthSettings?: () => void;
}) {
  const apiError = toApiError(error);
  if (
    apiError.code === "analytics_permission_missing" ||
    (apiError.code === "validation_error" &&
      `${apiError.message} ${apiError.details.map((item) => item.message).join(" ")}`
        .toLowerCase()
        .includes("reconnect"))
  ) {
    return (
      <Alert
        tone="warning"
        title="Reconnect this channel"
        action={
          onReconnect ? (
            <Button size="sm" variant="outline" onClick={onReconnect}>
              Reconnect
            </Button>
          ) : undefined
        }
      >
        Analytics permission is missing. Reconnect this channel to grant access.
      </Alert>
    );
  }
  if (apiError.code === "youtube_api_not_enabled") {
    return (
      <Alert
        tone="danger"
        title="YouTube API is not enabled"
        action={
          onOAuthSettings ? (
            <Button size="sm" variant="outline" onClick={onOAuthSettings}>
              OAuth settings
            </Button>
          ) : undefined
        }
      >
        The YouTube Data API or YouTube Analytics API is not enabled in your Google Cloud project.
        Enable YouTube Data API v3 and YouTube Analytics API, then update OAuth scopes and reconnect
        the channel.
      </Alert>
    );
  }
  if (apiError.code === "youtube_quota_exceeded") {
    return (
      <Alert tone="warning" title="YouTube daily limit reached">
        The daily YouTube API limit of your Google project is used up. It resets at midnight Pacific
        Time. Stored data remains available.
      </Alert>
    );
  }
  return (
    <Alert
      tone="danger"
      title="Analytics could not be loaded"
      action={
        <Button size="sm" variant="outline" onClick={retry}>
          Retry
        </Button>
      }
    >
      {getErrorMessage(error)}
    </Alert>
  );
}

export function QueryContent<T>({
  query,
  empty,
  children,
  onReconnect,
  onOAuthSettings,
}: {
  query: {
    data?: T;
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    refetch: () => unknown;
  };
  empty: boolean;
  children: (data: T) => ReactNode;
  onReconnect?: () => void;
  onOAuthSettings?: () => void;
}) {
  if (query.isLoading && query.data === undefined) return <AnalyticsLoading />;
  if (query.isError && query.data === undefined) {
    return (
      <AnalyticsError
        error={query.error}
        retry={() => void query.refetch()}
        onReconnect={onReconnect}
        onOAuthSettings={onOAuthSettings}
      />
    );
  }
  if (query.data === undefined) {
    return (
      <EmptyState
        title="No analytics data yet"
        description="Sync this channel or try a different date range."
        variant="lagoon"
      />
    );
  }
  if (empty) {
    return (
      <>
        {query.isError ? (
          <AnalyticsError
            error={query.error}
            retry={() => void query.refetch()}
            onReconnect={onReconnect}
            onOAuthSettings={onOAuthSettings}
          />
        ) : null}
        <EmptyState
          title="No analytics data yet"
          description="Sync this channel or try a different date range."
          variant="lagoon"
        />
      </>
    );
  }
  return (
    <>
      {query.isError ? (
        <AnalyticsError
          error={query.error}
          retry={() => void query.refetch()}
          onReconnect={onReconnect}
          onOAuthSettings={onOAuthSettings}
        />
      ) : null}
      {children(query.data)}
    </>
  );
}

export function AvailableNotice({ section }: { section: AvailableRows<unknown> }) {
  if (section.available) return null;
  return (
    <Alert tone="info" title="Data not available">
      {section.message || "Not enough data yet."}
    </Alert>
  );
}

export function formatCount(value: number | null | undefined): string {
  return value == null ? "—" : new Intl.NumberFormat().format(value);
}

export function formatPercent(value: number | null | undefined, digits = 1): string {
  return value == null ? "—" : `${value.toFixed(digits)}%`;
}

export function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null) return "—";
  const whole = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const remainder = whole % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${remainder}s`;
}

export function readableKey(value: string): string {
  const labels: Record<string, string> = {
    YT_SEARCH: "YouTube Search",
    SUGGESTED_VIDEO: "Suggested videos",
    BROWSE: "Browse features",
    EXTERNAL: "External",
    NOTIFICATION: "Notifications",
    SHORTS: "Shorts feed",
    CHANNEL: "Channel pages",
    PLAYLIST: "Playlists",
    SUBSCRIBED: "Subscribed",
    UNSUBSCRIBED: "Not subscribed",
    MOBILE: "Mobile",
    DESKTOP: "Computer",
    TABLET: "Tablet",
    TV: "TV",
    GAME_CONSOLE: "Game console",
    LIVE: "Live",
    VIDEO: "Videos",
  };
  return (
    labels[value] ??
    value
      .toLowerCase()
      .replaceAll("_", " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export function getCountryName(code: string): string {
  try {
    return new Intl.DisplayNames(undefined, { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}
