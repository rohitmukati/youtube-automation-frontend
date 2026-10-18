"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ACTIVE_JOB_STATUSES, POLL_INTERVALS } from "@/config/constants";
import { uploadsApi, type UploadListParams } from "@/features/uploads/api";
import { getErrorMessage } from "@/lib/api/errors";
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
      return jobs?.some((job) => isActiveStatus(job.status)) ? POLL_INTERVALS.activeList : false;
    },
  });
}

export function useUpload(id: string) {
  return useQuery({
    queryKey: queryKeys.uploads.detail(id),
    queryFn: () => uploadsApi.get(id),
    refetchInterval: (query) => {
      const job = query.state.data;
      return job && isActiveStatus(job.status) ? POLL_INTERVALS.activeJob : false;
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
      await queryClient.invalidateQueries({ queryKey: queryKeys.uploads.all });
    },
  });
}

export function useRetryUpload(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => uploadsApi.retry(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.uploads.all });
      toast.success("Retrying the failed channels.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCancelUpload(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => uploadsApi.cancel(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.uploads.all });
      toast.success("Upload cancelled for unfinished channels.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
