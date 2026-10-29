import {
  History,
  House,
  ImageIcon,
  MonitorPlay,
  Send,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  match?: (pathname: string) => boolean;
  quickAction?: { href: string; label: string };
}

const startsWith = (base: string) => (pathname: string) =>
  pathname === base || pathname.startsWith(`${base}/`);

export const primaryNav: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: House, match: startsWith("/dashboard") },
  {
    label: "YouTube Accounts",
    href: "/accounts",
    icon: MonitorPlay,
    match: (pathname) => pathname === "/accounts" || startsWith("/youtube")(pathname),
    quickAction: { href: "/accounts?connect=1", label: "Connect account" },
  },
  { label: "Thumbnails", href: "/storage", icon: ImageIcon, match: startsWith("/storage") },
];

export const channelNav: NavItem[] = [
  { label: "Publish", href: "/uploads/new", icon: Send, match: startsWith("/uploads/new") },
  {
    label: "Upload History",
    href: "/uploads",
    icon: History,
    match: (pathname) =>
      pathname === "/uploads" ||
      (pathname.startsWith("/uploads/") && !pathname.startsWith("/uploads/new")),
  },
];

export const settingsNav: NavItem = {
  label: "Settings",
  href: "/settings",
  icon: Settings,
  match: startsWith("/settings"),
};

export function resolveTitle(pathname: string): string {
  if (pathname === "/analytics") return "All Channel Analytics";
  if (/^\/accounts\/[^/]+\/videos\/[^/]+$/.test(pathname)) return "Video Analytics";
  if (/^\/accounts\/[^/]+$/.test(pathname)) return "Channel Analytics";
  const all = [...primaryNav, ...channelNav, settingsNav];
  const found = all.find((item) => item.match?.(pathname));
  return found?.label ?? "";
}
