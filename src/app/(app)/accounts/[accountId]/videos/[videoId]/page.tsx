import type { Metadata } from "next";
import { Suspense } from "react";
import { AnalyticsVideoDetail } from "@/features/analytics/components/analytics-video-detail";

export const metadata: Metadata = { title: "Video Analytics" };

export default function AnalyticsVideoPage() {
  return (
    <Suspense>
      <AnalyticsVideoDetail />
    </Suspense>
  );
}
