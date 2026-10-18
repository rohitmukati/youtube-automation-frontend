import type { Metadata } from "next";
import { Suspense } from "react";
import { ConnectResult } from "@/features/accounts/components/connect-result";

export const metadata: Metadata = { title: "Connecting account" };

export default function YouTubeConnectPage() {
  return (
    <Suspense>
      <ConnectResult />
    </Suspense>
  );
}
