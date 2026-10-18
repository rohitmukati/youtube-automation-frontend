import { env } from "@/config/env";

export const siteConfig = {
  name: env.appName,
  url: env.appUrl,
  description:
    "Publish one video to every YouTube channel you manage. Connect accounts, keep your media in one library, and track every upload live.",
  supportEmail: env.supportEmail,
  legalEntity: env.appName,
  legalUpdatedAt: "2026-10-18",
} as const;
