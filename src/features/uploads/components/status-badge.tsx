import { Badge } from "@/components/ui/badge";
import { jobStatusMeta, targetStatusMeta } from "@/features/uploads/status";
import type { UploadJobStatus, UploadTargetStatus } from "@/types/api";

export function JobStatusBadge({ status }: { status: UploadJobStatus }) {
  const meta = jobStatusMeta[status];
  return (
    <Badge tone={meta.tone} dot pulse={meta.pulse}>
      {meta.label}
    </Badge>
  );
}

export function TargetStatusBadge({ status }: { status: UploadTargetStatus }) {
  const meta = targetStatusMeta[status];
  return (
    <Badge tone={meta.tone} dot pulse={meta.pulse}>
      {meta.label}
    </Badge>
  );
}
