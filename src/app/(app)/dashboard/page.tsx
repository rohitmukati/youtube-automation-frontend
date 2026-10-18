import type { Metadata } from "next";
import { DashboardView } from "@/features/dashboard/components/dashboard-view";

export const metadata: Metadata = { title: "Home" };

export default function DashboardPage() {
  return <DashboardView />;
}
