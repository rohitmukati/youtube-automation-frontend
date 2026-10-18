import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/privacy", "/terms"],
      disallow: ["/dashboard", "/accounts", "/storage", "/uploads", "/settings", "/api/"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
