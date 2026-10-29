"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ACTIVE_JOB_STATUSES, POLL_INTERVALS } from "@/config/constants";
import { uploadsApi, type UploadListParams } from "@/features/uploads/api";
import { isJobFinished } from "@/features/uploads/rules";
import { uploadManager } from "@/features/uploads/upload-manager";
import { ApiError, getErrorMessage } from "@/lib/api/errors";
import { queryKeys } from "@/lib/query-keys";
import type { CreateUploadRequest, UploadJobStatus } from "@/types/api";

export function isActiveStatus(status: UploadJobStatus): boolean {
  return (ACTIVE_JOB_STATUSES as readonly string[]).includes(status);
}

export function useUploads(params: UploadListParams) {
  return useQuery({
    queryKey: queryKeys.uploads.list(params),
    queryFn: () => uploadsApi.list(params),
    placeholderData: keepPreviousData,
    refetchInterval: (query) => {
      const jobs = query.state.data?.jobs;
      return jobs?.some((job) => !isJobFinished(job)) ? POLL_INTERVALS.activeList : false;
    },
  });
}

export function useUpload(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.uploads.detail(id),
    queryFn: () => uploadsApi.get(id),
    enabled,
    refetchInterval: (query) => {
      const job = query.state.data;
      if (!job) return false;
      // The job status can trail the channel statuses for a moment, so keep polling until
      // the status is final AND no channel is active any more.
      if (isJobFinished(job)) return false;
      // While the browser is still sending the video there is little to see on the server.
      return job.status === "uploading_media"
        ? POLL_INTERVALS.activeList
        : POLL_INTERVALS.activeJob;
    },
  });
}

export function useQuota() {
  return useQuery({
    queryKey: queryKeys.uploads.quota(),
    queryFn: uploadsApi.quota,
    staleTime: 30_000,
  });
}

export function useCreateUpload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUploadRequest) => uploadsApi.create(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.uploads.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.uploads.quota() }),
      ]);
    },
  });
}

/** Messages for the two retry failures that need a custom text. */
function retryErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.code === "media_expired") {
    return "The video file is no longer stored. Please publish it again.";
  }
  return getErrorMessage(error);
}

export function useRetryUpload(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => uploadsApi.retry(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.uploads.all });
      toast.success("Retrying the failed channels.");
    },
    onError: async (error) => {
      toast.error(retryErrorMessage(error));
      // The file may have just been removed: refresh so the Retry button disappears.
      await queryClient.invalidateQueries({ queryKey: queryKeys.uploads.all });
    },
  });
}

export function useCancelUpload(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    // Also stops this browser's own in-flight requests when the video is still being sent.
    mutationFn: () => uploadManager.cancelOnServer(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.uploads.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.uploads.quota() });
      toast.success("Upload cancelled for unfinished channels.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
