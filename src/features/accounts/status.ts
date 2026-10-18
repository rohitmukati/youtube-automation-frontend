import type { YouTubeAccount } from "@/types/api";

export function getAccountStatus(account: YouTubeAccount): {
  label: string;
  tone: "success" | "warning" | "neutral";
} {
  if (account.needs_reconnect) return { label: "Needs reconnect", tone: "warning" };
  if (!account.is_active) return { label: "Inactive", tone: "neutral" };
  return { label: "Active", tone: "success" };
}

export function isAccountUsable(account: YouTubeAccount): boolean {
  return account.is_active && !account.needs_reconnect;
}

export function channelUrl(channelId: string): string {
  return `https://www.youtube.com/channel/${encodeURIComponent(channelId)}`;
}
