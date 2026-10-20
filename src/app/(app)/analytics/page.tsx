import type { Metadata } from "next";
import { AnalyticsPortfolio } from "@/features/analytics/components/analytics-portfolio";

export const metadata: Metadata = { title: "All Channel Analytics" };

export default function AnalyticsPage() {
  return <AnalyticsPortfolio />;
}
