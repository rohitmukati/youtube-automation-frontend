"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, Plus, RefreshCw } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountCard } from "@/features/accounts/components/account-card";
import { ConnectAccountDialog } from "@/features/accounts/components/connect-account-dialog";
import { EditAccountDialog } from "@/features/accounts/components/edit-account-dialog";
import { OAuthSettingsDialog } from "@/features/accounts/components/oauth-settings-dialog";
import {
  useAccounts,
  useConnectAccount,
  useCredentials,
  useDisconnectAccount,
  useRefreshAccounts,
} from "@/features/accounts/hooks";
import { getErrorMessage } from "@/lib/api/errors";
import type { YouTubeAccount } from "@/types/api";

export function AccountsView() {
  const router = useRouter();
  const params = useSearchParams();
  const { data, isLoading, isError, error, refetch } = useAccounts();
  const refresh = useRefreshAccounts();
  const disconnect = useDisconnectAccount();
  const credentials = useCredentials();
  const connectAccount = useConnectAccount();
  const credentialsConfigured = credentials.data?.configured;

  const [oauthOpen, setOauthOpen] = React.useState(false);
  const [pendingNickname, setPendingNickname] = React.useState<string | null>(null);

  const [connectManual, setConnectManual] = React.useState(false);
  const connectOpen = connectManual || params.get("connect") === "1";
  const [reconnectTarget, setReconnectTarget] = React.useState<YouTubeAccount | null>(null);
  const [editTarget, setEditTarget] = React.useState<YouTubeAccount | null>(null);
  const [disconnectTarget, setDisconnectTarget] = React.useState<YouTubeAccount | null>(null);
  const [refreshingId, setRefreshingId] = React.useState<string | null>(null);

  function setConnectOpen(open: boolean) {
    setConnectManual(open);
    if (!open && params.get("connect") === "1") router.replace("/accounts", { scroll: false });
  }

  const accounts = data?.accounts ?? [];

  function requireCredentials(nickname: string) {
    setPendingNickname(nickname);
    setConnectOpen(false);
    setReconnectTarget(null);
    setOauthOpen(true);
  }

  function closeOauth(open: boolean) {
    setOauthOpen(open);
    if (!open) setPendingNickname(null);
  }

  function continueAfterCredentials() {
    if (pendingNickname) connectAccount.mutate(pendingNickname);
    setPendingNickname(null);
  }

  function refreshOne(account: YouTubeAccount) {
    setRefreshingId(account.id);
    refresh.mutate(account.id, { onSettled: () => setRefreshingId(null) });
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <PageHeader
        title="YouTube Accounts"
        description="Connect every channel you publish to. Each account stays private to you and can be disconnected at any time."
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => refresh.mutate(undefined)}
              loading={refresh.isPending && refreshingId === null}
              disabled={accounts.length === 0}
            >
              <RefreshCw /> Refresh all
            </Button>
            <Button variant="outline" onClick={() => setOauthOpen(true)}>
              <KeyRound /> OAuth settings
            </Button>
            <Button onClick={() => setConnectOpen(true)}>
              <Plus /> Connect account
            </Button>
          </>
        }
      />

      {isError ? (
        <Alert
          tone="danger"
          title="Accounts could not be loaded"
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
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} className="h-64 rounded-3xl" />
          ))}
        </div>
      ) : null}

      {!isLoading && !isError && accounts.length === 0 ? (
        <EmptyState
          variant="lagoon"
          title="No YouTube accounts connected"
          description="Connect your first channel to start publishing. You can add as many Google accounts as you need."
          action={
            <Button onClick={() => setConnectOpen(true)}>
              <Plus /> Connect account
            </Button>
          }
        />
      ) : null}

      {accounts.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={setEditTarget}
              onReconnect={setReconnectTarget}
              onDisconnect={setDisconnectTarget}
              onRefresh={refreshOne}
              refreshing={refreshingId === account.id}
            />
          ))}
        </div>
      ) : null}

      <ConnectAccountDialog
        open={connectOpen}
        onOpenChange={setConnectOpen}
        credentialsConfigured={credentialsConfigured}
        onCredentialsRequired={requireCredentials}
      />
      <ConnectAccountDialog
        open={Boolean(reconnectTarget)}
        onOpenChange={(open) => !open && setReconnectTarget(null)}
        initialNickname={reconnectTarget?.nickname}
        reconnect
        credentialsConfigured={credentialsConfigured}
        onCredentialsRequired={requireCredentials}
      />
      <OAuthSettingsDialog
        open={oauthOpen}
        onOpenChange={closeOauth}
        notice={
          pendingNickname
            ? "Save your Google Client ID and Client Secret and we will continue connecting your account right away."
            : undefined
        }
        onSaved={continueAfterCredentials}
      />
      <EditAccountDialog
        account={editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
      />
      <ConfirmDialog
        open={Boolean(disconnectTarget)}
        onOpenChange={(open) => !open && setDisconnectTarget(null)}
        title={`Disconnect ${disconnectTarget?.nickname ?? "account"}?`}
        description="Access to this channel is revoked and it can no longer receive uploads. Your upload history stays intact."
        confirmLabel="Disconnect"
        onConfirm={async () => {
          if (disconnectTarget) await disconnect.mutateAsync(disconnectTarget.id);
        }}
      />
    </div>
  );
}
