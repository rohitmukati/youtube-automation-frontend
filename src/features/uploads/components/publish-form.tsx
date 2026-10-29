"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarClock, CircleCheck, Film, ImageIcon, Send, X } from "lucide-react";
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
import { LIMITS, THUMBNAIL_MIME } from "@/config/constants";
import { useAccounts } from "@/features/accounts/hooks";
import { isAccountUsable } from "@/features/accounts/status";
import { FilePreview } from "@/features/storage/components/file-card";
import { StoragePickerDialog } from "@/features/storage/components/storage-picker-dialog";
import { ChannelPicker } from "@/features/uploads/components/channel-picker";
import { UnfinishedUploadsBanner } from "@/features/uploads/components/unfinished-uploads-banner";
import { UploadProgressPanel } from "@/features/uploads/components/upload-progress-panel";
import { takePendingVideo } from "@/features/uploads/file-handoff";
import { useCancelUpload, useCreateUpload, useQuota, useUpload } from "@/features/uploads/hooks";
import { publishSchema, type PublishValues } from "@/features/uploads/schemas";
import { LANGUAGES, YOUTUBE_CATEGORIES } from "@/features/uploads/status";
import { uploadManager, useUploadSession } from "@/features/uploads/upload-manager";
import { validateVideoFile, VIDEO_ACCEPT } from "@/features/uploads/video-file";
import { toApiError } from "@/lib/api/errors";
import { applyServerErrors } from "@/lib/forms";
import { cn, formatBytes, pluralize, toLocalInputValue } from "@/lib/utils";
import type { CreateUploadRequest, PrivacyStatus, StorageFile } from "@/types/api";

function titleFromFileName(name: string): string {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, LIMITS.titleMax);
}

/** A request id lets the server recognise a repeated request (double click, network retry). */
function newRequestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
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
  const queryClient = useQueryClient();
  const params = useSearchParams();
  const againId = params.get("again");

  const accountsQuery = useAccounts();
  const quotaQuery = useQuota();
  const create = useCreateUpload();
  const againQuery = useUpload(againId ?? "", Boolean(againId));

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const requestIdRef = React.useRef<string | null>(null);
  const prefilledRef = React.useRef(false);
  const navigatedRef = React.useRef(false);

  const [thumbnail, setThumbnail] = React.useState<StorageFile | null>(null);
  const [thumbnailPicker, setThumbnailPicker] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const [activeJobId, setActiveJobId] = React.useState<string | null>(null);
  const [copiedFrom, setCopiedFrom] = React.useState(false);

  const session = useUploadSession(activeJobId);
  const cancel = useCancelUpload(activeJobId ?? "");
  // The form is locked from the moment Publish is pressed until the video is on its way.
  const locked = create.isPending || session !== null;

  const form = useForm<PublishValues>({
    resolver: zodResolver(publishSchema),
    defaultValues: {
      videoFile: null,
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
  const videoFile = values.videoFile ?? null;

  // A new request id is needed whenever the user changes anything after a failed attempt.
  const valuesKey = JSON.stringify({
    ...values,
    videoFile: videoFile?.name,
    size: videoFile?.size,
  });
  React.useEffect(() => {
    requestIdRef.current = null;
  }, [valuesKey]);

  const selectVideo = React.useCallback(
    (file: File) => {
      const problem = validateVideoFile(file);
      if (problem) {
        form.setError("videoFile", { type: "validate", message: problem });
        return;
      }
      form.setValue("videoFile", file, { shouldValidate: true });
      if (!form.getValues("title")) form.setValue("title", titleFromFileName(file.name));
    },
    [form],
  );

  // A video picked on the dashboard is handed over here. Nothing is uploaded yet.
  React.useEffect(() => {
    const picked = takePendingVideo();
    if (picked) selectVideo(picked);
  }, [selectVideo]);

  const accounts = accountsQuery.data?.accounts;
  const againJob = againQuery.data;

  // "Publish again": copy the details of an earlier publish. The user picks the file again.
  React.useEffect(() => {
    if (!againJob || !accounts || prefilledRef.current) return;
    prefilledRef.current = true;
    const usable = new Set(accounts.filter(isAccountUsable).map((account) => account.id));
    form.setValue("title", againJob.title);
    form.setValue("description", againJob.description);
    form.setValue("tags", againJob.tags);
    form.setValue("categoryId", againJob.category_id);
    form.setValue("language", againJob.default_language ?? "");
    form.setValue("madeForKids", againJob.made_for_kids);
    form.setValue("notifySubscribers", againJob.notify_subscribers);
    if (!againJob.publish_at) form.setValue("privacy", againJob.privacy_status);
    form.setValue(
      "accountIds",
      againJob.targets
        .map((target) => target.account_id)
        .filter((id): id is string => id !== null && usable.has(id)),
    );
    setCopiedFrom(true);
  }, [againJob, accounts, form]);

  // Phase A finished: the server publishes from here, so show the per channel progress.
  React.useEffect(() => {
    if (session?.phase === "done" && activeJobId && !navigatedRef.current) {
      navigatedRef.current = true;
      router.push(`/uploads/${activeJobId}`);
    }
  }, [session?.phase, activeJobId, router]);

  const accountList = accounts ?? [];
  const quota = quotaQuery.data;
  const selectedCount = values.accountIds.length;
  const overQuota = quota ? selectedCount > quota.remaining : false;
  const [minSchedule] = React.useState(() => toLocalInputValue(new Date(Date.now() + 10 * 60_000)));

  function onSubmit(data: PublishValues) {
    const file = data.videoFile;
    if (overQuota || locked || !file) return;
    const clientRequestId = (requestIdRef.current ??= newRequestId());
    const request: CreateUploadRequest = {
      file: { name: file.name, size_bytes: file.size, content_type: file.type || null },
      client_request_id: clientRequestId,
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
    };
    create.mutate(request, {
      onSuccess: ({ job, upload }) => {
        requestIdRef.current = null;
        navigatedRef.current = false;
        setActiveJobId(job.id);
        // The browser now sends the video straight to cloud storage, then calls `complete`.
        uploadManager.start(job.id, file, upload, queryClient);
      },
      onError: (error) => {
        const apiError = toApiError(error);
        // Keep the request id after a network error so a repeat cannot create a second upload.
        if (apiError.status !== 0) requestIdRef.current = null;
        const { handled } = applyServerErrors(error, form.setError, {
          title: "title",
          description: "description",
          tags: "tags",
          publish_at: "publishAt",
          account_ids: "accountIds",
          "file.name": "videoFile",
          "file.size_bytes": "videoFile",
          "file.content_type": "videoFile",
          thumbnail_file_id: "thumbnailFileId",
        });
        if (handled) return;
        if (
          apiError.code === "google_credentials_missing" ||
          apiError.code === "google_credentials_invalid"
        ) {
          toast.error(apiError.message, {
            action: { label: "Open settings", onClick: () => router.push("/accounts?oauth=1") },
          });
          return;
        }
        toast.error(
          apiError.code === "staging_busy"
            ? "Uploads are very busy. Try again in a few minutes."
            : apiError.message,
        );
      },
    });
  }

  function handleCancel() {
    if (!activeJobId) return;
    cancel.mutate(undefined, { onSettled: () => setActiveJobId(null) });
  }

  function handleDismiss() {
    if (activeJobId) uploadManager.dismiss(activeJobId);
    setActiveJobId(null);
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
        description="Choose a video from your computer, write its details once, and send it to every channel you select."
      />

      <UnfinishedUploadsBanner excludeJobId={activeJobId} />

      {copiedFrom ? (
        <Alert tone="info" title="Details copied from an earlier publish">
          Choose the video file again to publish it. Nothing is uploaded until you press Publish.
        </Alert>
      ) : null}

      <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-4 sm:gap-6">
          {session ? (
            <Section title="Uploading your video">
              <UploadProgressPanel
                session={session}
                cancelling={cancel.isPending}
                onCancel={handleCancel}
                onRetry={() => activeJobId && uploadManager.retry(activeJobId, queryClient)}
                onDismiss={handleDismiss}
              />
            </Section>
          ) : null}

          <fieldset
            disabled={locked}
            className="m-0 flex min-w-0 flex-col gap-4 border-0 p-0 sm:gap-6"
          >
            <Section
              title="Video"
              description="Pick the video on your computer. It uploads only when you press Publish."
            >
              <Field error={errors.videoFile?.message}>
                {videoFile ? (
                  <div className="border-border flex items-center gap-3 rounded-2xl border p-3 sm:gap-4 sm:p-4">
                    <span className="bg-muted text-muted-foreground grid size-12 shrink-0 place-items-center rounded-xl">
                      <Film className="size-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground flex items-center gap-1.5 truncate text-sm font-medium">
                        <CircleCheck className="text-success size-4 shrink-0" aria-hidden />
                        <span className="truncate">{videoFile.name}</span>
                      </p>
                      <p className="text-muted-foreground text-[13px]">
                        {formatBytes(videoFile.size)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(event) => {
                      event.preventDefault();
                      setDragging(false);
                      const file = event.dataTransfer.files[0];
                      if (file) selectVideo(file);
                    }}
                    className={cn(
                      "hover:bg-muted/50 flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-9 text-center transition-colors",
                      dragging ? "border-foreground bg-muted" : "border-border-strong",
                    )}
                  >
                    <Film className="text-muted-foreground size-6" aria-hidden />
                    <span className="text-foreground text-sm font-medium">
                      Choose a video from your computer
                    </span>
                    <span className="text-muted-foreground text-[13px]">
                      or drag and drop it here · MP4, M4V, MOV, AVI, MKV, WEBM or MPEG · up to{" "}
                      {formatBytes(LIMITS.videoBytes)}
                    </span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={VIDEO_ACCEPT}
                  className="sr-only"
                  tabIndex={-1}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (file) selectVideo(file);
                  }}
                />
              </Field>

              <Field
                label="Thumbnail"
                optional
                hint="JPG or PNG from your thumbnail library. Up to 2 MB works best."
                error={errors.thumbnailFileId?.message}
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
                      accounts={accountList}
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
          </fieldset>
        </div>

        <aside className="lg:sticky lg:top-24">
          <Card>
            <CardHeader title="Summary" />
            <CardBody className="flex flex-col gap-5">
              <dl className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Video</dt>
                  <dd className="text-foreground max-w-40 truncate text-right">
                    {videoFile?.name ?? "Not chosen"}
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
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">This publish uses</dt>
                  <dd className="text-foreground tabular-nums">{selectedCount}</dd>
                </div>
              </dl>

              {overQuota ? (
                <Alert tone="warning">
                  You selected {pluralize(selectedCount, "channel")} but only {quota?.remaining}{" "}
                  {quota?.remaining === 1 ? "upload is" : "uploads are"} left today.
                </Alert>
              ) : null}

              {accountList.length > 0 &&
              accountList.every((account) => !isAccountUsable(account)) ? (
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
                disabled={overQuota || locked}
                className="w-full"
              >
                <Send />{" "}
                {selectedCount > 0
                  ? `Publish to ${pluralize(selectedCount, "channel")}`
                  : "Publish"}
              </Button>
              <p className="text-muted-foreground text-center text-[13px]">
                The video uploads to the cloud when you press Publish. After that you can close this
                tab.
              </p>
            </CardBody>
          </Card>
        </aside>
      </div>

      <StoragePickerDialog
        open={thumbnailPicker}
        onOpenChange={setThumbnailPicker}
        title="Choose a thumbnail"
        description="Pick a JPG or PNG image from your library."
        contentTypes={THUMBNAIL_MIME}
        onSelect={(file) => {
          setThumbnail(file);
          form.setValue("thumbnailFileId", file.id);
        }}
      />
    </form>
  );
}
