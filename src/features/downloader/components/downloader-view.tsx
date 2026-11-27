"use client";

import * as React from "react";
import { AudioLines, Clipboard, Download, Film, Link2, Search, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { usePrepareDownload, useVideoInfo } from "@/features/downloader/hooks";
import { downloaderApi } from "@/features/downloader/api";
import {
  detectPlatform,
  formatDuration,
  startBrowserDownload,
} from "@/features/downloader/url";
import { getErrorMessage } from "@/lib/api/errors";
import { cn, formatBytes } from "@/lib/utils";
import type { DownloadOption, VideoInfo } from "@/types/api";

const PLATFORM_LABEL = { youtube: "YouTube", instagram: "Instagram" } as const;

function OptionRow({
  option,
  busy,
  disabled,
  onDownload,
}: {
  option: DownloadOption;
  busy: boolean;
  disabled: boolean;
  onDownload: (option: DownloadOption) => void;
}) {
  const Icon = option.kind === "audio" ? AudioLines : Film;
  return (
    <li className="border-border flex items-center gap-3 rounded-2xl border px-3.5 py-3 sm:px-4">
      <span className="bg-muted text-body grid size-10 shrink-0 place-items-center rounded-xl">
        <Icon className="size-[18px]" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-foreground truncate text-sm font-medium">{option.label}</p>
        <p className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-2 text-xs">
          <span className="uppercase">{option.ext}</span>
          {option.size_bytes ? (
            <span>
              {option.needs_processing ? "about " : ""}
              {formatBytes(option.size_bytes)}
            </span>
          ) : null}
          {option.needs_processing ? <span>starts after a few seconds</span> : null}
        </p>
      </div>
      <Button
        size="sm"
        variant="primary"
        loading={busy}
        disabled={disabled}
        onClick={() => onDownload(option)}
        aria-label={`Download ${option.label}`}
      >
        {busy ? null : <Download />} Download
      </Button>
    </li>
  );
}

function VideoCard({
  video,
  activeOptionId,
  onDownload,
}: {
  video: VideoInfo;
  activeOptionId: string | null;
  onDownload: (option: DownloadOption) => void;
}) {
  const videos = video.options.filter((option) => option.kind === "video");
  const audio = video.options.filter((option) => option.kind === "audio");
  const duration = formatDuration(video.duration_seconds);
  const anyBusy = activeOptionId !== null;

  return (
    <Card>
      <CardBody className="flex flex-col gap-5 sm:gap-6">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div
            className={cn(
              "bg-muted relative shrink-0 overflow-hidden rounded-2xl sm:w-60",
              video.platform === "instagram" ? "aspect-[4/5] w-40 self-center sm:self-start" : "aspect-video",
            )}
          >
            {video.thumbnail_url ? (
              <img
                src={video.thumbnail_url}
                alt=""
                referrerPolicy="no-referrer"
                className="size-full object-cover"
              />
            ) : (
              <span className="text-muted-foreground grid size-full place-items-center">
                <Film className="size-8" aria-hidden />
              </span>
            )}
            {duration ? (
              <span className="absolute right-2 bottom-2 rounded-md bg-black/75 px-1.5 py-0.5 text-xs font-medium text-white">
                {duration}
              </span>
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <Badge tone="neutral">{PLATFORM_LABEL[video.platform]}</Badge>
            <h2 className="text-foreground mt-2 text-base leading-snug font-semibold tracking-tight [overflow-wrap:anywhere] sm:text-lg">
              {video.title}
            </h2>
            {video.uploader ? (
              <p className="text-muted-foreground mt-1 truncate text-sm">{video.uploader}</p>
            ) : null}
          </div>
        </div>

        {videos.length > 0 ? (
          <section aria-label="Video qualities">
            <h3 className="text-foreground mb-2.5 text-sm font-medium">Video</h3>
            <ul className="flex flex-col gap-2">
              {videos.map((option) => (
                <OptionRow
                  key={option.id}
                  option={option}
                  busy={activeOptionId === option.id}
                  disabled={anyBusy}
                  onDownload={onDownload}
                />
              ))}
            </ul>
          </section>
        ) : null}

        {audio.length > 0 ? (
          <section aria-label="Audio">
            <h3 className="text-foreground mb-2.5 text-sm font-medium">Audio</h3>
            <ul className="flex flex-col gap-2">
              {audio.map((option) => (
                <OptionRow
                  key={option.id}
                  option={option}
                  busy={activeOptionId === option.id}
                  disabled={anyBusy}
                  onDownload={onDownload}
                />
              ))}
            </ul>
          </section>
        ) : null}
      </CardBody>
    </Card>
  );
}

export function DownloaderView() {
  const [value, setValue] = React.useState("");
  const [localError, setLocalError] = React.useState<string | null>(null);
  const [video, setVideo] = React.useState<VideoInfo | null>(null);
  const [activeOptionId, setActiveOptionId] = React.useState<string | null>(null);

  const info = useVideoInfo();
  const prepare = usePrepareDownload();

  const errorMessage = localError ?? (info.isError ? getErrorMessage(info.error) : null);

  function reset() {
    setValue("");
    setVideo(null);
    setLocalError(null);
    info.reset();
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const url = value.trim();
    if (!url || info.isPending) return;
    if (!detectPlatform(url)) {
      setLocalError("Please paste a YouTube or Instagram video link.");
      return;
    }
    setLocalError(null);
    setVideo(null);
    info.mutate(url, { onSuccess: (data) => setVideo(data) });
  }

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setValue(text.trim());
        setLocalError(null);
      }
    } catch {
      toast.error("Could not read the clipboard. Paste the link into the box instead.");
    }
  }

  function onDownload(option: DownloadOption) {
    if (!video || activeOptionId) return;
    setActiveOptionId(option.id);
    prepare.mutate(
      { url: video.source_url, optionId: option.id },
      {
        onSuccess: (result) => {
          startBrowserDownload(downloaderApi.streamUrl(result.token));
          toast.success("Your download is starting. Check your browser's downloads.");
        },
        onError: (error) => toast.error(getErrorMessage(error)),
        onSettled: () => {
          // The browser takes over the file from here, so the button is free again shortly.
          window.setTimeout(() => setActiveOptionId(null), 1500);
        },
      },
    );
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <PageHeader
        title="Video Downloader"
        description="Paste a YouTube or Instagram link, choose a quality and download it. The video is not saved on our servers: it goes straight to your browser."
      />

      <Card>
        <CardHeader title="Video link" description="YouTube videos and Shorts, Instagram reels and video posts." />
        <CardBody>
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Link2
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
                aria-hidden
              />
              <Input
                type="url"
                inputMode="url"
                autoComplete="off"
                spellCheck={false}
                value={value}
                onChange={(event) => {
                  setValue(event.target.value);
                  if (localError) setLocalError(null);
                }}
                placeholder="https://www.youtube.com/watch?v=..."
                aria-label="Video link"
                className="pr-20 pl-10"
              />
              <div className="absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center">
                {value ? (
                  <button
                    type="button"
                    onClick={reset}
                    aria-label="Clear link"
                    className="text-muted-foreground hover:bg-muted hover:text-foreground grid size-8 place-items-center rounded-lg"
                  >
                    <X className="size-4" />
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => void pasteFromClipboard()}
                  aria-label="Paste from clipboard"
                  className="text-muted-foreground hover:bg-muted hover:text-foreground grid size-8 place-items-center rounded-lg"
                >
                  <Clipboard className="size-4" />
                </button>
              </div>
            </div>
            <Button type="submit" size="lg" loading={info.isPending} disabled={!value.trim()}>
              {info.isPending ? null : <Search />} Get video
            </Button>
          </form>

          {info.isPending ? (
            <p className="text-muted-foreground mt-3 text-sm" role="status">
              Reading the video. This can take up to a minute the first time.
            </p>
          ) : null}
        </CardBody>
      </Card>

      {errorMessage ? (
        <Alert tone="danger" title="This video could not be loaded">
          {errorMessage}
        </Alert>
      ) : null}

      {video ? (
        <VideoCard video={video} activeOptionId={activeOptionId} onDownload={onDownload} />
      ) : null}

      <Alert tone="info" title="Download only what you may use">
        Download videos that are yours or that you have permission to use. Respect the creator&apos;s
        rights and the rules of YouTube and Instagram.
      </Alert>
    </div>
  );
}