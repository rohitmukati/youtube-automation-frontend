"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { storageApi, type StorageListParams } from "@/features/storage/api";
import { getErrorMessage } from "@/lib/api/errors";
import { queryKeys } from "@/lib/query-keys";

export function useStorageFiles(params: StorageListParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.storage.list(params),
    queryFn: () => storageApi.list(params),
    placeholderData: keepPreviousData,
    staleTime: 4 * 60_000,
    enabled,
  });
}

export function useUpdateTags() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, tags }: { id: string; tags: string[] }) => storageApi.updateTags(id, tags),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.storage.all });
      toast.success("Tags updated.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => storageApi.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.storage.all });
      toast.success("File deleted.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
