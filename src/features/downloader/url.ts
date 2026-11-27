import type { DownloaderPlatform } from "@/types/api";

const YOUTUBE_HOSTS = ["youtube.com", "youtu.be"];
const INSTAGRAM_HOSTS = ["instagram.com"];

function hostMatches(host: string, domains: string[]): boolean {
  return domains.some((domain) => host === domain || host.endsWith(`.${domain}`));
}

/** Quick check in the browser. The server checks the link again and is the one that decides. */
export function detectPlatform(raw: string): DownloaderPlatform | null {
  const value = raw.trim();
  if (!value) return null;
  try {
    const url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    const host = url.hostname.toLowerCase();
    if (hostMatches(host, YOUTUBE_HOSTS)) return "youtube";
    if (hostMatches(host, INSTAGRAM_HOSTS)) return "instagram";
    return null;
  } catch {
    return null;
  }
}

export function formatDuration(totalSeconds: number | null | undefined): string {
  if (!totalSeconds || totalSeconds < 0) return "";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const pad = (value: number) => String(value).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

/**
 * Starts a normal browser download. The server answers with `Content-Disposition: attachment`,
 * so the page stays where it is and the browser shows its own download progress.
 */
export function startBrowserDownload(url: string): void {
  const link = document.createElement("a");
  link.href = url;
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  window.setTimeout(() => link.remove(), 1000);
}