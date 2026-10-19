"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { accountsApi, credentialsApi } from "@/features/accounts/api";
import { getErrorMessage, toApiError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/query-keys";

export function useAccounts() {
  return useQuery({
    queryKey: queryKeys.accounts.list(),
    queryFn: accountsApi.list,
    staleTime: 60_000,
  });
}

export function useConnectAccount() {
  return useMutation({
    mutationFn: (nickname: string) => accountsApi.connect(nickname),
    onSuccess: ({ auth_url }) => {
      window.location.assign(auth_url);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string; nickname?: string; notes?: string | null }) =>
      accountsApi.update(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      toast.success("Account updated.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDisconnectAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountsApi.disconnect(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      toast.success("Account disconnected.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useRefreshAccounts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id?: string) => (id ? accountsApi.refreshOne(id) : accountsApi.refreshAll()),
    onSuccess: async (_data, id) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      toast.success(id ? "Account details refreshed." : "All accounts refreshed.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCredentials() {
  return useQuery({
    queryKey: queryKeys.credentials,
    queryFn: credentialsApi.get,
    staleTime: 60_000,
  });
}

export function useSaveCredentials() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: credentialsApi.save,
    onSuccess: async (status) => {
      queryClient.setQueryData(queryKeys.credentials, status);
      // Changing the Client ID flags connected channels as "needs reconnect" on the server.
      await queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      toast.success(status.message ?? "Google OAuth credentials saved.");
    },
    // The form shows field-level errors; the toast only covers failures that have no field.
    onError: (error) => {
      const { details } = toApiError(error);
      if (details.length === 0) toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteCredentials() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: credentialsApi.remove,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.credentials }),
        queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all }),
      ]);
      toast.success("Google OAuth credentials removed.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}