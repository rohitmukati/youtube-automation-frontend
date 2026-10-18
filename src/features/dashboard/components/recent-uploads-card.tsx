"use client";

import Link from "next/link";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { JobStatusBadge } from "@/features/uploads/components/status-badge";
import { useUploads } from "@/features/uploads/hooks";
import { formatRelative } from "@/lib/format";

export function RecentUploadsCard() {
  const { data, isLoading } = useUploads({ limit: 5, offset: 0 });
  const jobs = data?.jobs ?? [];

  return (
    <Card className="lg:col-span-3">
      <CardHeader
        title="Recent uploads"
        description="Your latest multi-channel publishes."
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/uploads">View history</Link>
          </Button>
        }
      />
      <CardBody className="pt-4">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </div>
        ) : null}

        {!isLoading && jobs.length === 0 ? (
          <div className="bg-muted flex flex-col items-start gap-3 rounded-2xl px-5 py-5">
            <p className="text-body text-sm">
              Nothing published yet. Pick a video and choose the channels it should go to.
            </p>
            <Button asChild size="sm">
              <Link href="/uploads/new">
                <Send /> Publish a video
              </Link>
            </Button>
          </div>
        ) : null}

        {jobs.length > 0 ? (
          <ul className="divide-border -mx-3 divide-y">
            {jobs.map((job) => (
              <li key={job.id}>
                <Link
                  href={`/uploads/${job.id}`}
                  className="hover:bg-muted/60 flex items-center gap-4 rounded-2xl px-3 py-3.5 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate text-sm font-medium">{job.title}</p>
                    <p className="text-muted-foreground truncate text-[13px]">
                      {job.source_file_name} · {formatRelative(job.created_at)}
                    </p>
                  </div>
                  <span className="text-muted-foreground hidden text-[13px] tabular-nums sm:block">
                    {job.done_count} of {job.total_channels} published
                  </span>
                  <JobStatusBadge status={job.status} />
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </CardBody>
    </Card>
  );
}
