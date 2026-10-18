"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { LIMITS } from "@/config/constants";
import { useUpdateAccount } from "@/features/accounts/hooks";
import type { YouTubeAccount } from "@/types/api";

const schema = z.object({
  nickname: z
    .string()
    .trim()
    .min(1, "Give this account a name.")
    .max(LIMITS.nicknameMax, `Use at most ${LIMITS.nicknameMax} characters.`),
  notes: z.string().max(LIMITS.notesMax, `Use at most ${LIMITS.notesMax} characters.`),
});

type Values = z.infer<typeof schema>;

interface EditAccountDialogProps {
  account: YouTubeAccount | null;
  onOpenChange: (open: boolean) => void;
}

export function EditAccountDialog({ account, onOpenChange }: EditAccountDialogProps) {
  const update = useUpdateAccount();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { nickname: "", notes: "" },
  });

  React.useEffect(() => {
    if (account) form.reset({ nickname: account.nickname, notes: account.notes ?? "" });
  }, [account, form]);

  const notes = useWatch({ control: form.control, name: "notes" });

  function onSubmit(values: Values) {
    if (!account) return;
    update.mutate(
      {
        id: account.id,
        nickname: values.nickname,
        notes: values.notes.trim() === "" ? null : values.notes,
      },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog
      open={Boolean(account)}
      onOpenChange={(next) => (update.isPending ? undefined : onOpenChange(next))}
    >
      <DialogContent>
        <DialogHeader
          title="Edit account"
          description={account ? account.channel_title : undefined}
        />
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <DialogBody className="flex flex-col gap-5">
            <Field label="Account name" error={form.formState.errors.nickname?.message}>
              <Input {...form.register("nickname")} />
            </Field>
            <Field
              label="Notes"
              optional
              error={form.formState.errors.notes?.message}
              hint={`${notes.length} / ${LIMITS.notesMax}`}
            >
              <Textarea
                rows={4}
                placeholder="Anything worth remembering about this channel"
                {...form.register("notes")}
              />
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={update.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" loading={update.isPending}>
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
