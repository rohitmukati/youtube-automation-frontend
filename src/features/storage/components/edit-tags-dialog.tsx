"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { TagInput } from "@/components/ui/tag-input";
import { LIMITS } from "@/config/constants";
import { useUpdateTags } from "@/features/storage/hooks";
import type { StorageFile } from "@/types/api";

interface EditTagsDialogProps {
  file: StorageFile | null;
  onOpenChange: (open: boolean) => void;
}

function EditTagsForm({
  file,
  onClose,
  onPendingChange,
}: {
  file: StorageFile;
  onClose: () => void;
  onPendingChange: (pending: boolean) => void;
}) {
  const update = useUpdateTags();
  const [tags, setTags] = React.useState<string[]>(file.tags);

  function save() {
    onPendingChange(true);
    update.mutate(
      { id: file.id, tags },
      {
        onSuccess: onClose,
        onSettled: () => onPendingChange(false),
      },
    );
  }

  return (
    <>
      <DialogHeader title="Edit tags" description={file.original_name} />
      <DialogBody>
        <Field
          label="Tags"
          hint="Press Enter or type a comma to add a tag. Tags help you find files later."
        >
          <TagInput value={tags} onChange={setTags} maxTagLength={LIMITS.tagMax} />
        </Field>
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={update.isPending}>
          Cancel
        </Button>
        <Button loading={update.isPending} onClick={save}>
          Save tags
        </Button>
      </DialogFooter>
    </>
  );
}

export function EditTagsDialog({ file, onOpenChange }: EditTagsDialogProps) {
  const [pending, setPending] = React.useState(false);
  return (
    <Dialog
      open={Boolean(file)}
      onOpenChange={(open) => (pending ? undefined : onOpenChange(open))}
    >
      <DialogContent>
        {file ? (
          <EditTagsForm
            key={file.id}
            file={file}
            onClose={() => onOpenChange(false)}
            onPendingChange={setPending}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
