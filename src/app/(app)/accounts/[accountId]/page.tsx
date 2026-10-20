import type { Metadata } from "next";
import { Suspense } from "react";
import { AnalyticsDashboard } from "@/features/analytics/components/analytics-dashboard";

export const metadata: Metadata = { title: "Channel Analytics" };

export default function AccountAnalyticsPage() {
  return (
    <Suspense>
      <AnalyticsDashboard />
    </Suspense>
  );
}
