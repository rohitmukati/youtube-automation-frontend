import { env } from "@/config/env";
import { api } from "@/lib/api/client";
import type { PrepareDownloadResponse, VideoInfo } from "@/types/api";

/** Reading a video can take up to a minute on the server, so these calls get a longer timeout. */
const READ_TIMEOUT_MS = 90_000;

export const downloaderApi = {
  async info(url: string, signal?: AbortSignal): Promise<VideoInfo> {
    const { data } = await api.post<VideoInfo>(
      "/downloader/info",
      { url },
      { signal, timeout: READ_TIMEOUT_MS },
    );
    return data;
  },

  async prepare(
    url: string,
    optionId: string,
    signal?: AbortSignal,
  ): Promise<PrepareDownloadResponse> {
    const { data } = await api.post<PrepareDownloadResponse>(
      "/downloader/prepare",
      { url, option_id: optionId },
      { signal, timeout: READ_TIMEOUT_MS },
    );
    return data;
  },

  /** A normal link cannot carry the login header, so the short-lived token is part of the address. */
  streamUrl(token: string): string {
    const query = new URLSearchParams({ token });
    if (env.skipNgrokWarning) query.set("ngrok-skip-browser-warning", "true");
    return `${env.apiUrl}/downloader/stream?${query.toString()}`;
  },
};