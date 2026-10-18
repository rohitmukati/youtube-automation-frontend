"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, BookOpen, KeyRound, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { CopyButton } from "@/components/shared/copy-button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input, PasswordInput } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { OAuthSetupGuide } from "@/features/accounts/components/oauth-setup-guide";
import { credentialsSchema, type CredentialsValues } from "@/features/accounts/credentials";
import {
  useCredentials,
  useDeleteCredentials,
  useSaveCredentials,
} from "@/features/accounts/hooks";
import { getErrorMessage } from "@/lib/api/errors";

interface OAuthSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Shown when the dialog was opened because a connect attempt needs credentials first. */
  notice?: string;
  /** Called after credentials were saved successfully. */
  onSaved?: () => void;
}

const emptyValues: CredentialsValues = { clientId: "", clientSecret: "" };

export function OAuthSettingsDialog({
  open,
  onOpenChange,
  notice,
  onSaved,
}: OAuthSettingsDialogProps) {
  const credentials = useCredentials();
  const save = useSaveCredentials();
  const remove = useDeleteCredentials();
  const [view, setView] = React.useState<"form" | "guide">("form");
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const form = useForm<CredentialsValues>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: emptyValues,
  });

  const configured = credentials.data?.configured ?? false;
  const redirectUrl = credentials.data?.redirectUrl ?? null;
  const savedClientId = credentials.data?.clientId ?? null;

  React.useEffect(() => {
    if (open) form.reset(emptyValues);
  }, [open, form]);

  function handleOpenChange(next: boolean) {
    if (!next) setView("form");
    onOpenChange(next);
  }

  function onSubmit(values: CredentialsValues) {
    save.mutate(
      { client_id: values.clientId, client_secret: values.clientSecret },
      {
        onSuccess: () => {
          form.reset(emptyValues);
          onSaved?.();
          handleOpenChange(false);
        },
      },
    );
  }

  const busy = save.isPending || remove.isPending;

  return (
    <>
      <Dialog open={open} onOpenChange={(next) => (busy ? undefined : handleOpenChange(next))}>
        <DialogContent size="lg">
          {view === "guide" ? (
            <>
              <DialogHeader
                title="Google Cloud setup guide"
                description="Follow these steps once to get your own Client ID and Client Secret."
              />
              <DialogBody>
                <OAuthSetupGuide redirectUrl={redirectUrl} />
              </DialogBody>
              <DialogFooter>
                <Button variant="outline" onClick={() => setView("form")}>
                  <ArrowLeft /> Back to settings
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader
                title="OAuth settings"
                description="Your own Google Client ID and Client Secret are used to connect your YouTube channels."
              />
              <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
                <DialogBody className="flex flex-col gap-5">
                  {notice ? (
                    <Alert tone="warning" title="Add your Google credentials first">
                      {notice}
                    </Alert>
                  ) : null}

                  {credentials.isLoading ? (
                    <div className="flex flex-col gap-3">
                      <Skeleton className="h-16 rounded-2xl" />
                      <Skeleton className="h-11 rounded-xl" />
                      <Skeleton className="h-11 rounded-xl" />
                    </div>
                  ) : null}

                  {credentials.isError ? (
                    <Alert
                      tone="danger"
                      title="Settings could not be loaded"
                      action={
                        <Button size="sm" variant="outline" onClick={() => credentials.refetch()}>
                          Try again
                        </Button>
                      }
                    >
                      {getErrorMessage(credentials.error)}
                    </Alert>
                  ) : null}

                  {!credentials.isLoading && !credentials.isError ? (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Badge tone={configured ? "success" : "warning"} dot>
                            {configured ? "Credentials saved" : "Not configured"}
                          </Badge>
                          {configured && savedClientId ? (
                            <span className="text-muted-foreground max-w-56 truncate text-[13px]">
                              {savedClientId}
                            </span>
                          ) : null}
                        </div>
                        <Button size="sm" variant="soft" onClick={() => setView("guide")}>
                          <BookOpen /> Setup guide
                        </Button>
                      </div>

                      <Field
                        label="Redirect URL"
                        hint="Add this exact URL under “Authorized redirect URIs” in your Google Cloud OAuth client."
                      >
                        {redirectUrl ? (
                          <div className="flex items-center gap-2">
                            <Input readOnly value={redirectUrl} onFocus={(e) => e.target.select()} />
                            <CopyButton value={redirectUrl} size="md" className="shrink-0" />
                          </div>
                        ) : (
                          <p className="bg-muted text-muted-foreground rounded-xl px-3.5 py-3 text-[13px]">
                            The server did not return a redirect URL yet.
                          </p>
                        )}
                      </Field>

                      <Field
                        label="Client ID"
                        required
                        error={form.formState.errors.clientId?.message}
                        hint={
                          configured
                            ? "Enter a new Client ID to replace the saved one."
                            : "Looks like 1234567890-abc.apps.googleusercontent.com"
                        }
                      >
                        <Input
                          autoComplete="off"
                          spellCheck={false}
                          placeholder="xxxx.apps.googleusercontent.com"
                          {...form.register("clientId")}
                        />
                      </Field>

                      <Field
                        label="Client Secret"
                        required
                        error={form.formState.errors.clientSecret?.message}
                        hint="Stored securely on the server and never shown again."
                      >
                        <PasswordInput
                          autoComplete="new-password"
                          spellCheck={false}
                          placeholder="GOCSPX-…"
                          {...form.register("clientSecret")}
                        />
                      </Field>

                      {configured ? (
                        <Alert tone="info" title="Changing credentials">
                          Saving new credentials replaces the old ones. Channels connected with the
                          old credentials may need to be reconnected.
                        </Alert>
                      ) : null}
                    </>
                  ) : null}
                </DialogBody>
                <DialogFooter className="sm:justify-between">
                  <div>
                    {configured ? (
                      <Button
                        variant="danger-outline"
                        onClick={() => setConfirmDelete(true)}
                        disabled={busy}
                      >
                        <Trash2 /> Remove
                      </Button>
                    ) : null}
                  </div>
                  <div className="flex flex-col-reverse gap-2 sm:flex-row">
                    <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={busy}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      loading={save.isPending}
                      disabled={credentials.isLoading || credentials.isError}
                    >
                      <KeyRound /> {configured ? "Update credentials" : "Save credentials"}
                    </Button>
                  </div>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Remove Google credentials?"
        description="Your saved Client ID and Client Secret are deleted. Connected channels will stop working until you add credentials again."
        confirmLabel="Remove"
        onConfirm={() => remove.mutateAsync()}
      />
    </>
  );
}