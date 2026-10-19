"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarClock, Film, ImageIcon, Send, X } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Switch } from "@/components/ui/switch";
import { TagInput } from "@/components/ui/tag-input";
import { LIMITS } from "@/config/constants";
import { useAccounts } from "@/features/accounts/hooks";
import { isAccountUsable } from "@/features/accounts/status";
import { FilePreview } from "@/features/storage/components/file-card";
import { StoragePickerDialog } from "@/features/storage/components/storage-picker-dialog";
import { useStorageFiles } from "@/features/storage/hooks";
import { ChannelPicker } from "@/features/uploads/components/channel-picker";
import { useCreateUpload, useQuota } from "@/features/uploads/hooks";
import { publishSchema, type PublishValues } from "@/features/uploads/schemas";
import { LANGUAGES, YOUTUBE_CATEGORIES } from "@/features/uploads/status";
import { applyServerErrors } from "@/lib/forms";
import { formatBytes, pluralize, toLocalInputValue } from "@/lib/utils";
import type { PrivacyStatus, StorageFile } from "@/types/api";

function titleFromFileName(name: string): string {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, LIMITS.titleMax);
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader title={title} description={description} />
      <CardBody className="flex flex-col gap-5">{children}</CardBody>
    </Card>
  );
}

export function PublishForm() {
  const router = useRouter();
  const params = useSearchParams();
  const fileParam = params.get("file");

  const accountsQuery = useAccounts();
  const quotaQuery = useQuota();
  const create = useCreateUpload();

  const [video, setVideo] = React.useState<StorageFile | null>(null);
  const [thumbnail, setThumbnail] = React.useState<StorageFile | null>(null);
  const [videoPicker, setVideoPicker] = React.useState(false);
  const [thumbnailPicker, setThumbnailPicker] = React.useState(false);

  const form = useForm<PublishValues>({
    resolver: zodResolver(publishSchema),
    defaultValues: {
      storageFileId: "",
      thumbnailFileId: null,
      title: "",
      description: "",
      tags: [],
      categoryId: "22",
      privacy: "public",
      schedule: false,
      publishAt: "",
      madeForKids: false,
      notifySubscribers: true,
      language: "",
      accountIds: [],
    },
  });
  const { errors } = form.formState;
  const values = useWatch({ control: form.control }) as PublishValues;

  const preselect = useStorageFiles({ type: "video", limit: 100, offset: 0 }, Boolean(fileParam));

  const selectVideo = React.useCallback(
    (file: StorageFile) => {
      setVideo(file);
      form.setValue("storageFileId", file.id, { shouldValidate: true });
      if (!form.getValues("title")) form.setValue("title", titleFromFileName(file.original_name));
    },
    [form],
  );

  const preselected = fileParam
    ? preselect.data?.files.find((file) => file.id === fileParam)
    : undefined;
  const activeVideo = video ?? preselected ?? null;

  React.useEffect(() => {
    if (!preselected || video) return;
    form.setValue("storageFileId", preselected.id, { shouldValidate: true });
    if (!form.getValues("title"))
      form.setValue("title", titleFromFileName(preselected.original_name));
  }, [preselected, video, form]);

  const accounts = accountsQuery.data?.accounts ?? [];
  const quota = quotaQuery.data;
  const selectedCount = values.accountIds.length;
  const overQuota = quota ? selectedCount > quota.remaining : false;
  const [minSchedule] = React.useState(() => toLocalInputValue(new Date(Date.now() + 10 * 60_000)));

  function onSubmit(data: PublishValues) {
    if (overQuota) return;
    create.mutate(
      {
        storage_file_id: data.storageFileId,
        account_ids: data.accountIds,
        title: data.title.trim(),
        description: data.description,
        tags: data.tags,
        category_id: data.categoryId,
        privacy_status: data.schedule ? "private" : data.privacy,
        publish_at: data.schedule ? new Date(data.publishAt).toISOString() : null,
        made_for_kids: data.madeForKids,
        default_language: data.language || null,
        notify_subscribers: data.notifySubscribers,
        thumbnail_file_id: data.thumbnailFileId,
      },
      {
        onSuccess: (job) => {
          toast.success(`Publishing to ${pluralize(job.total_channels, "channel")}.`);
          router.push(`/uploads/${job.id}`);
        },
        onError: (error) => {
          const { handled, error: apiError } = applyServerErrors(error, form.setError, {
            title: "title",
            description: "description",
            tags: "tags",
            publish_at: "publishAt",
            account_ids: "accountIds",
            storage_file_id: "storageFileId",
          });
          if (!handled) toast.error(apiError.message);
        },
      },
    );
  }

  const description = values.description;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-6 sm:gap-8"
    >
      <PageHeader
        title="Publish"
        description="Choose a video, write its details once, and send it to every channel you select."
      />

      <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-4 sm:gap-6">
          <Section
            title="Video"
            description="Pick a video from Storage and an optional custom thumbnail."
          >
            <Field error={errors.storageFileId?.message}>
              {activeVideo ? (
                <div className="border-border flex items-center gap-3 rounded-2xl border p-2 sm:gap-4 sm:p-3">
                  <FilePreview
                    file={activeVideo}
                    className="aspect-video w-24 shrink-0 rounded-xl sm:w-32"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate text-sm font-medium">
                      {activeVideo.original_name}
                    </p>
                    <p className="text-muted-foreground text-[13px]">
                      {formatBytes(activeVideo.size_bytes)}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setVideoPicker(true)}>
                    Change
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setVideoPicker(true)}
                  className="border-border-strong hover:bg-muted/50 flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-9 text-center transition-colors"
                >
                  <Film className="text-muted-foreground size-6" aria-hidden />
                  <span className="text-foreground text-sm font-medium">Choose a video</span>
                  <span className="text-muted-foreground text-[13px]">
                    From your Storage library
                  </span>
                </button>
              )}
            </Field>

            <Field
              label="Thumbnail"
              optional
              hint="Images up to 2 MB work best as YouTube thumbnails."
            >
              {thumbnail ? (
                <div className="border-border flex items-center gap-3 rounded-2xl border p-2 sm:gap-4 sm:p-3">
                  <FilePreview
                    file={thumbnail}
                    className="aspect-video w-24 shrink-0 rounded-xl sm:w-32"
                  />
                  <p className="text-foreground min-w-0 flex-1 truncate text-sm">
                    {thumbnail.original_name}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    shape="rounded"
                    aria-label="Remove thumbnail"
                    onClick={() => {
                      setThumbnail(null);
                      form.setValue("thumbnailFileId", null);
                    }}
                  >
                    <X />
                  </Button>
                </div>
              ) : (
                <div>
                  <Button variant="outline" onClick={() => setThumbnailPicker(true)}>
                    <ImageIcon /> Choose an image
                  </Button>
                </div>
              )}
            </Field>
          </Section>

          <Section title="Details" description="The same details are used for every channel.">
            <Field
              label="Title"
              required
              error={errors.title?.message}
              hint={`${values.title.length} / ${LIMITS.titleMax}`}
            >
              <Input
                placeholder="Add a title that describes the video"
                maxLength={LIMITS.titleMax + 20}
                {...form.register("title")}
              />
            </Field>
            <Field
              label="Description"
              optional
              error={errors.description?.message}
              hint={`${new TextEncoder().encode(description).length} / ${LIMITS.descriptionMaxBytes} bytes`}
            >
              <Textarea
                rows={6}
                placeholder="Tell viewers what this video is about"
                {...form.register("description")}
              />
            </Field>
            <Controller
              control={form.control}
              name="tags"
              render={({ field }) => (
                <Field
                  label="Tags"
                  optional
                  error={errors.tags?.message}
                  hint="Press Enter or type a comma to add a tag."
                >
                  <TagInput
                    value={field.value}
                    onChange={field.onChange}
                    maxTagLength={LIMITS.tagMax}
                  />
                </Field>
              )}
            />
          </Section>

          <Section title="Channels" description="Choose where this video should be published.">
            <Controller
              control={form.control}
              name="accountIds"
              render={({ field }) => (
                <Field error={errors.accountIds?.message}>
                  <ChannelPicker
                    accounts={accounts}
                    loading={accountsQuery.isLoading}
                    error={accountsQuery.isError}
                    retrying={accountsQuery.isFetching}
                    onRetry={() => void accountsQuery.refetch()}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </Field>
              )}
            />
          </Section>

          <Section title="Visibility and schedule">
            <Controller
              control={form.control}
              name="privacy"
              render={({ field }) => (
                <Field label="Visibility">
                  <SegmentedControl<PrivacyStatus>
                    label="Visibility"
                    value={values.schedule ? "private" : field.value}
                    onChange={field.onChange}
                    options={[
                      { value: "public", label: "Public" },
                      { value: "unlisted", label: "Unlisted" },
                      { value: "private", label: "Private" },
                    ]}
                    className={values.schedule ? "pointer-events-none opacity-60" : undefined}
                  />
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="schedule"
              render={({ field }) => (
                <div className="border-border flex items-center justify-between gap-4 rounded-2xl border p-4">
                  <div>
                    <p className="text-foreground flex items-center gap-2 text-sm font-medium">
                      <CalendarClock className="size-4" aria-hidden /> Schedule for later
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-[13px]">
                      The video is uploaded now as private and goes live at the time you choose.
                    </p>
                  </div>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      if (checked && !form.getValues("publishAt"))
                        form.setValue("publishAt", minSchedule);
                    }}
                    aria-label="Schedule for later"
                  />
                </div>
              )}
            />

            {values.schedule ? (
              <Field
                label="Publish at"
                error={errors.publishAt?.message}
                hint="Uses your device time zone."
              >
                <Input type="datetime-local" min={minSchedule} {...form.register("publishAt")} />
              </Field>
            ) : null}
          </Section>

          <Section title="More options">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Category">
                <Select {...form.register("categoryId")}>
                  {YOUTUBE_CATEGORIES.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Video language">
                <Select {...form.register("language")}>
                  {LANGUAGES.map((language) => (
                    <option key={language.code} value={language.code}>
                      {language.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <Controller
              control={form.control}
              name="madeForKids"
              render={({ field }) => (
                <div className="border-border flex items-center justify-between gap-4 rounded-2xl border p-4">
                  <div>
                    <p className="text-foreground text-sm font-medium">Made for kids</p>
                    <p className="text-muted-foreground mt-0.5 text-[13px]">
                      Required by YouTube for content directed at children.
                    </p>
                  </div>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label="Made for kids"
                  />
                </div>
              )}
            />
            <Controller
              control={form.control}
              name="notifySubscribers"
              render={({ field }) => (
                <div className="border-border flex items-center justify-between gap-4 rounded-2xl border p-4">
                  <div>
                    <p className="text-foreground text-sm font-medium">Notify subscribers</p>
                    <p className="text-muted-foreground mt-0.5 text-[13px]">
                      Send a notification when the video goes public.
                    </p>
                  </div>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label="Notify subscribers"
                  />
                </div>
              )}
            />
          </Section>
        </div>

        <aside className="lg:sticky lg:top-24">
          <Card>
            <CardHeader title="Summary" />
            <CardBody className="flex flex-col gap-5">
              <dl className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Video</dt>
                  <dd className="text-foreground max-w-40 truncate text-right">
                    {activeVideo?.original_name ?? "Not chosen"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Channels</dt>
                  <dd className="text-foreground">{selectedCount}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Visibility</dt>
                  <dd className="text-foreground capitalize">
                    {values.schedule ? "Scheduled" : values.privacy}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Uploads left today</dt>
                  <dd className="text-foreground tabular-nums">{quota ? quota.remaining : "—"}</dd>
                </div>
              </dl>

              {overQuota ? (
                <Alert tone="warning">
                  You selected {pluralize(selectedCount, "channel")} but only {quota?.remaining}{" "}
                  {quota?.remaining === 1 ? "upload is" : "uploads are"} left today.
                </Alert>
              ) : null}

              {accounts.length > 0 && accounts.every((account) => !isAccountUsable(account)) ? (
                <Alert tone="warning">
                  None of your accounts can publish right now.{" "}
                  <Link href="/accounts" className="font-medium underline underline-offset-4">
                    Review accounts
                  </Link>
                </Alert>
              ) : null}

              <Button
                type="submit"
                size="lg"
                loading={create.isPending}
                disabled={overQuota}
                className="w-full"
              >
                <Send />{" "}
                {selectedCount > 0
                  ? `Publish to ${pluralize(selectedCount, "channel")}`
                  : "Publish"}
              </Button>
            </CardBody>
          </Card>
        </aside>
      </div>

      <StoragePickerDialog
        open={videoPicker}
        onOpenChange={setVideoPicker}
        type="video"
        title="Choose a video"
        onSelect={selectVideo}
      />
      <StoragePickerDialog
        open={thumbnailPicker}
        onOpenChange={setThumbnailPicker}
        type="image"
        title="Choose a thumbnail"
        onSelect={(file) => {
          setThumbnail(file);
          form.setValue("thumbnailFileId", file.id);
        }}
      />
    </form>
  );
}
