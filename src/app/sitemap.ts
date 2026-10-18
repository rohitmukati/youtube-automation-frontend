import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/login", "/signup", "/privacy", "/terms"];
  return paths.map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(siteConfig.legalUpdatedAt),
  }));
}
