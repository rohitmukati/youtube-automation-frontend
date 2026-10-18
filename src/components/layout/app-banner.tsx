"use client";

import * as React from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useAccounts } from "@/features/accounts/hooks";
import { pluralize } from "@/lib/utils";

export function AppBanner() {
  const { data } = useAccounts();
  const [dismissed, setDismissed] = React.useState(false);
  const count = data?.accounts.filter((account) => account.needs_reconnect).length ?? 0;

  if (dismissed || count === 0) return null;

  return (
    <div className="bg-foreground text-background relative flex items-center justify-center gap-2 px-12 py-2.5 text-center text-[13px]">
      <p>
        {pluralize(count, "YouTube account")} {count === 1 ? "needs" : "need"} to be reconnected
        before {count === 1 ? "it" : "they"} can publish.{" "}
        <Link href="/accounts" className="font-medium underline underline-offset-4">
          Review accounts
        </Link>
      </p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="hover:bg-background/15 absolute right-3 grid size-7 place-items-center rounded-full"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
