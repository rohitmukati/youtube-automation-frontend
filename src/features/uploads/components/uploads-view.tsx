"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight, Search, Send } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { LIMITS } from "@/config/constants";
import { useAccounts } from "@/features/accounts/hooks";
import { JobStatusBadge } from "@/features/uploads/components/status-badge";
import { useUploads } from "@/features/uploads/hooks";
import { jobStatusMeta, targetStatusMeta } from "@/features/uploads/status";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getErrorMessage } from "@/lib/api/errors";
import { formatDateTime } from "@/lib/format";
import type { UploadJobStatus } from "@/types/api";

const STATUSES = Object.keys(jobStatusMeta) as UploadJobStatus[];

function isStatus(value: string | null): value is UploadJobStatus {
  return value !== null && (STATUSES as string[]).includes(value);
}

export function UploadsView() {
  const params = useSearchParams();
  const initialStatus = params.get("status");

  const [status, setStatus] = React.useState<UploadJobStatus | "">(
    isStatus(initialStatus) ? initialStatus : "",
  );
  const [accountId, setAccountId] = React.useState("");
  const [search, setSearch] = React.useState(params.get("search") ?? "");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const [offset, setOffset] = React.useState(0);
  const debouncedSearch = useDebouncedValue(search.trim());

  const accounts = useAccounts().data?.accounts ?? [];
  const { data, isLoading, isFetching, isError, error, refetch } = useUploads({
    status: status || undefined,
    account_id: accountId || undefined,
    search: debouncedSearch || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    limit: LIMITS.historyPageSize,
    offset,
  });

  const jobs = data?.jobs ?? [];
  const filtering = Boolean(status || accountId || debouncedSearch || dateFrom || dateTo);

  function clearFilters() {
    setStatus("");
    setAccountId("");
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setOffset(0);
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Upload History"
        description="Every multi-channel publish, with live status for each channel."
        actions={
          <Button asChild>
            <Link href="/uploads/new">
              <Send /> Publish
            </Link>
          </Button>
        }
      />

      <Card className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
            aria-hidden
          />
          <Input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setOffset(0);
            }}
            placeholder="Search by title"
            aria-label="Search by title"
            className="h-10 pl-10"
          />
        </div>
        <Select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as UploadJobStatus | "");
            setOffset(0);
          }}
          aria-label="Filter by status"
          className="h-10"
        >
          <option value="">All statuses</option>
          {STATUSES.map((value) => (
            <option key={value} value={value}>
              {jobStatusMeta[value].label}
            </option>
          ))}
        </Select>
        <Select
          value={accountId}
          onChange={(event) => {
            setAccountId(event.target.value);
            setOffset(0);
          }}
          aria-label="Filter by account"
          className="h-10"
        >
          <option value="">All accounts</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.nickname}
            </option>
          ))}
        </Select>
        <Input
          type="date"
          value={dateFrom}
          max={dateTo || undefined}
          onChange={(event) => {
            setDateFrom(event.target.value);
            setOffset(0);
          }}
          aria-label="From date"
          className="h-10"
        />
        <Input
          type="date"
          value={dateTo}
          min={dateFrom || undefined}
          onChange={(event) => {
            setDateTo(event.target.value);
            setOffset(0);
          }}
          aria-label="To date"
          className="h-10"
        />
      </Card>

      {isError ? (
        <Alert
          tone="danger"
          title="Upload history could not be loaded"
          action={
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Try again
            </Button>
          }
        >
          {getErrorMessage(error)}
        </Alert>
      ) : null}

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : null}

      {!isLoading && !isError && jobs.length === 0 ? (
        filtering ? (
          <EmptyState
            variant="bloom"
            title="No uploads match these filters"
            description="Adjust or clear the filters to see more."
            action={
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            title="No uploads yet"
            description="Publish a video and you will be able to follow it here, channel by channel."
            action={
              <Button asChild>
                <Link href="/uploads/new">
                  <Send /> Publish a video
                </Link>
              </Button>
            }
          />
        )
      ) : null}

      {jobs.length > 0 ? (
        <div className={isFetching ? "opacity-70 transition-opacity" : "transition-opacity"}>
          <ul className="flex flex-col gap-3">
            {jobs.map((job) => (
              <li key={job.id}>
                <Link
                  href={`/uploads/${job.id}`}
                  className="border-border bg-card hover:border-border-strong hover:bg-muted/40 flex items-center gap-4 rounded-2xl border px-5 py-4 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate text-[15px] font-medium">{job.title}</p>
                    <p className="text-muted-foreground mt-0.5 truncate text-[13px]">
                      {job.source_file_name} · {formatDateTime(job.created_at)}
                    </p>
                  </div>
                  <ul className="hidden items-center -space-x-2 md:flex" aria-label="Channels">
                    {job.channels.slice(0, 4).map((channel, index) => (
                      <li
                        key={`${channel.account_id ?? channel.channel_title}-${index}`}
                        title={`${channel.account_nickname} · ${targetStatusMeta[channel.status].label}`}
                      >
                        <Avatar
                          name={channel.account_nickname}
                          size={28}
                          className="ring-card ring-2"
                        />
                      </li>
                    ))}
                    {job.channels.length > 4 ? (
                      <li className="text-muted-foreground pl-3 text-xs">
                        +{job.channels.length - 4}
                      </li>
                    ) : null}
                  </ul>
                  <span className="text-muted-foreground hidden w-28 text-right text-[13px] tabular-nums sm:block">
                    {job.done_count} of {job.total_channels} published
                  </span>
                  <JobStatusBadge status={job.status} />
                  <ChevronRight className="text-muted-foreground size-4 shrink-0" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <Pagination
              total={data?.total ?? 0}
              limit={LIMITS.historyPageSize}
              offset={offset}
              onChange={setOffset}
              loading={isFetching}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
