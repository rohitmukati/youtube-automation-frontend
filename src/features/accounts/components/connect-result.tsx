"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { CircleAlert, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { queryKeys } from "@/lib/query-keys";

export function ConnectResult() {
  const router = useRouter();
  const params = useSearchParams();
  const queryClient = useQueryClient();
  const success = params.get("status") === "success";
  const channel = params.get("channel");
  const reason = params.get("reason");
  const detail =
    reason === "access_denied"
      ? "Access was declined in Google, so nothing was connected. Try again and approve the requested permissions."
      : reason === "missing_params"
        ? null
        : reason;

  React.useEffect(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
    if (!success) return;
    const timer = window.setTimeout(() => router.replace("/accounts"), 2800);
    return () => window.clearTimeout(timer);
  }, [success, queryClient, router]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-5 py-20 text-center">
      <span
        className={`grid size-16 place-items-center rounded-full ${success ? "bg-success-soft text-success" : "bg-danger-soft text-danger"}`}
      >
        {success ? <CircleCheck className="size-8" /> : <CircleAlert className="size-8" />}
      </span>
      <div>
        <h1 className="text-foreground text-2xl font-medium tracking-tight">
          {success ? "Account connected" : "We could not connect the account"}
        </h1>
        <p className="text-muted-foreground mt-2 text-[15px]">
          {success
            ? `${channel ?? "Your YouTube channel"} is ready to receive uploads. Taking you back to your accounts.`
            : (detail ??
              "Google did not complete the connection. No changes were made. Try again, and make sure you approve every permission requested.")}
        </p>
      </div>
      <div className="flex gap-2">
        {success ? null : (
          <Button asChild>
            <Link href="/accounts?connect=1">Try again</Link>
          </Button>
        )}
        <Button asChild variant="outline">
          <Link href="/accounts">Back to accounts</Link>
        </Button>
      </div>
    </div>
  );
}
