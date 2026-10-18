import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountsView } from "@/features/accounts/components/accounts-view";

export const metadata: Metadata = { title: "YouTube Accounts" };

export default function AccountsPage() {
  return (
    <Suspense>
      <AccountsView />
    </Suspense>
  );
}
