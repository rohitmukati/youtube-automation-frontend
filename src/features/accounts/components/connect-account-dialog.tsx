"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LIMITS } from "@/config/constants";
import { useConnectAccount } from "@/features/accounts/hooks";

const schema = z.object({
  nickname: z
    .string()
    .trim()
    .min(1, "Give this account a name.")
    .max(LIMITS.nicknameMax, `Use at most ${LIMITS.nicknameMax} characters.`),
});

type Values = z.infer<typeof schema>;

interface ConnectAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialNickname?: string;
  reconnect?: boolean;
  /** false = the user has no Google credentials saved yet; undefined = still unknown. */
  credentialsConfigured?: boolean;
  /** Called instead of connecting when credentials are missing. */
  onCredentialsRequired?: (nickname: string) => void;
}

export function ConnectAccountDialog({
  open,
  onOpenChange,
  initialNickname = "",
  reconnect,
  credentialsConfigured,
  onCredentialsRequired,
}: ConnectAccountDialogProps) {
  const connect = useConnectAccount();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { nickname: initialNickname },
  });

  React.useEffect(() => {
    if (open) form.reset({ nickname: initialNickname });
  }, [open, initialNickname, form]);

  function onSubmit(values: Values) {
    if (credentialsConfigured === false && onCredentialsRequired) {
      onCredentialsRequired(values.nickname);
      return;
    }
    connect.mutate(values.nickname);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (connect.isPending ? undefined : onOpenChange(next))}
    >
      <DialogContent>
        <DialogHeader
          title={reconnect ? "Reconnect YouTube account" : "Connect a YouTube account"}
          description="You will be sent to Google to approve access, then brought back here."
        />
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <DialogBody className="flex flex-col gap-5">
            <Field
              label="Account name"
              error={form.formState.errors.nickname?.message}
              hint="Only you see this name, for example “Gaming channel”."
            >
              <Input autoFocus placeholder="Gaming channel" {...form.register("nickname")} />
            </Field>
            {credentialsConfigured === false ? (
              <Alert tone="warning" title="Google credentials needed">
                You have not added your Google Client ID and Client Secret yet. Continue and we will
                ask for them first.
              </Alert>
            ) : null}
            <Alert tone="info" title="What access is requested">
              Permission to upload videos and thumbnails, read basic channel details, and see the
              Google account email. Nothing is ever published without you starting an upload.
            </Alert>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={connect.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" loading={connect.isPending}>
              Continue to Google
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}