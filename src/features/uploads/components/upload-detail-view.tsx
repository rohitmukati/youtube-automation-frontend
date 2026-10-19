"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Ban, Clock, ExternalLink, RotateCcw } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { JobStatusBadge, TargetStatusBadge } from "@/features/uploads/components/status-badge";
import { useCancelUpload, useRetryUpload, useUpload } from "@/features/uploads/hooks";
import { categoryLabel, errorHints, thumbnailStatusLabel } from "@/features/uploads/status";
import { ApiError, getErrorMessage } from "@/lib/api/errors";
import { formatBytes, pluralize } from "@/lib/utils";
import { formatDateTime, formatRelative } from "@/lib/format";
import type { UploadJobDetail, UploadTarget } from "@/types/api";

function overallProgress(job: UploadJobDetail): number {
  if (job.targets.length === 0) return 0;
  const total = job.targets.reduce((sum, target) => {
    if (target.status === "done") return sum + 100;
    if (target.status === "failed" || target.status === "cancelled") return sum + 100;
    return sum + target.progress_percent;
  }, 0);
  return total / job.targets.length;
}

function TargetRow({ target }: { target: UploadTarget }) {
  const inFlight =
    target.status === "uploading" || target.status === "retrying" || target.status === "pending";
  const thumbLabel = thumbnailStatusLabel[target.thumbnail_status];

  return (
    <li className="flex flex-col gap-3 py-5 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center gap-3">
        <Avatar name={target.account_nickname} size={40} />
        <div className="min-w-0 flex-1">
          <p className="text-foreground truncate text-sm font-medium">{target.account_nickname}</p>
          <p className="text-muted-foreground truncate text-[13px]">{target.channel_title}</p>
        </div>
        <TargetStatusBadge status={target.status} />
        {target.youtube_url ? (
          <Button asChild variant="outline" size="sm">
            <a href={target.youtube_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink /> Watch on YouTube
            </a>
          </Button>
        ) : null}
      </div>

      {inFlight ? (
        <div className="flex items-center gap-3">
          <Progress
            value={target.progress_percent}
            className="flex-1"
            label={`Upload progress for ${target.account_nickname}`}
          />
          <span className="text-muted-foreground w-10 text-right text-[13px] tabular-nums">
            {Math.round(target.progress_percent)}%
          </span>
        </div>
      ) : null}

      <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
        {target.attempts > 0 ? (
          <span>
            Attempt {Math.min(target.attempts, target.max_attempts)} of {target.max_attempts}
          </span>
        ) : null}
        {target.status === "retrying" && target.next_attempt_at ? (
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden /> Next attempt{" "}
            {formatRelative(target.next_attempt_at)}
          </span>
        ) : null}
        {target.finished_at ? <span>Finished {formatDateTime(target.finished_at)}</span> : null}
        {thumbLabel ? <span>{thumbLabel}</span> : null}
      </div>

      {target.error_message ? (
        <Alert tone="danger" title={target.error_message}>
          {target.error_code ? (errorHints[target.error_code] ?? null) : null}
        </Alert>
      ) : null}
      {target.thumbnail_error ? (
        <Alert tone="warning" title="Thumbnail could not be set">
          {target.thumbnail_error}
        </Alert>
      ) : null}
    </li>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-muted-foreground text-[13px]">{label}</dt>
      <dd className="text-foreground mt-0.5 text-sm">{children}</dd>
    </div>
  );
}

export function UploadDetailView({ id }: { id: string }) {
  const { data: job, isLoading, isError, error, refetch } = useUpload(id);
  const retry = useRetryUpload(id);
  const cancel = useCancelUpload(id);
  const [confirmCancel, setConfirmCancel] = React.useState(false);

  const back = (
    <Link
      href="/uploads"
      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
    >
      <ArrowLeft className="size-4" aria-hidden /> Upload History
    </Link>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        {back}
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-32 rounded-3xl" />
        <Skeleton className="h-80 rounded-3xl" />
      </div>
    );
  }

  if (isError || !job) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <div className="flex flex-col gap-6">
        {back}
        {notFound ? (
          <EmptyState
            title="Upload not found"
            description="It may have been removed, or the link is incorrect."
            action={
              <Button asChild>
                <Link href="/uploads">Go to history</Link>
              </Button>
            }
          />
        ) : (
          <Alert
            tone="danger"
            title="This upload could not be loaded"
            action={
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                Try again
              </Button>
            }
          >
            {getErrorMessage(error)}
          </Alert>
        )}
      </div>
    );
  }

  const active = job.active_count > 0;
  const canRetry = job.failed_count > 0 && !active;
  const progress = overallProgress(job);

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {back}

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-foreground text-2xl leading-tight font-medium tracking-tight sm:text-[28px]">
              {job.title}
            </h1>
            <JobStatusBadge status={job.status} />
          </div>
          <p className="text-muted-foreground mt-1.5 text-[15px]">
            {job.source_file_name} · {formatBytes(job.source_size_bytes)} · Started{" "}
            {formatDateTime(job.created_at)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canRetry ? (
            <Button variant="outline" onClick={() => retry.mutate()} loading={retry.isPending}>
              <RotateCcw /> Retry failed
            </Button>
          ) : null}
          {active ? (
            <Button variant="danger-outline" onClick={() => setConfirmCancel(true)}>
              <Ban /> Cancel unfinished
            </Button>
          ) : null}
        </div>
      </header>

      <Card>
        <CardBody className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4">
            <p className="text-foreground text-sm font-medium">
              {active ? "Publishing in progress" : "Finished"}
            </p>
            <p className="text-muted-foreground text-sm tabular-nums">{Math.round(progress)}%</p>
          </div>
          <Progress
            value={progress}
            tone={
              job.status === "completed"
                ? "success"
                : job.status === "failed"
                  ? "danger"
                  : "default"
            }
            label="Overall progress"
          />
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Detail label="Channels">{job.total_channels}</Detail>
            <Detail label="Published">{job.done_count}</Detail>
            <Detail label="In progress">{job.active_count}</Detail>
            <Detail label="Failed or cancelled">{job.failed_count + job.cancelled_count}</Detail>
          </dl>
        </CardBody>
      </Card>

      <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <Card>
          <CardHeader title="Channels" description={pluralize(job.targets.length, "channel")} />
          <CardBody>
            <ul className="divide-border divide-y">
              {job.targets.map((target) => (
                <TargetRow key={target.id} target={target} />
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Video details" />
          <CardBody>
            <dl className="flex flex-col gap-4">
              <Detail label="Visibility">
                <span className="capitalize">{job.privacy_status}</span>
              </Detail>
              {job.publish_at ? (
                <Detail label="Scheduled for">{formatDateTime(job.publish_at)}</Detail>
              ) : null}
              <Detail label="Category">{categoryLabel(job.category_id)}</Detail>
              <Detail label="Language">{job.default_language ?? "Not specified"}</Detail>
              <Detail label="Made for kids">{job.made_for_kids ? "Yes" : "No"}</Detail>
              <Detail label="Notify subscribers">{job.notify_subscribers ? "Yes" : "No"}</Detail>
              {job.thumbnail_file_name ? (
                <Detail label="Thumbnail">{job.thumbnail_file_name}</Detail>
              ) : null}
              {job.description ? (
                <Detail label="Description">
                  <span className="text-body line-clamp-6 whitespace-pre-line">
                    {job.description}
                  </span>
                </Detail>
              ) : null}
              {job.tags.length > 0 ? (
                <Detail label="Tags">
                  <span className="mt-1 flex flex-wrap gap-1.5">
                    {job.tags.map((tag) => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                  </span>
                </Detail>
              ) : null}
            </dl>
          </CardBody>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="Cancel unfinished channels?"
        description="Channels that already published are not affected. Unfinished channels will stop and can be retried later."
        confirmLabel="Cancel uploads"
        onConfirm={() => cancel.mutateAsync()}
      />
    </div>
  );
}
