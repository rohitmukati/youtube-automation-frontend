"use client";

import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { useAccounts } from "@/features/accounts/hooks";
import { Button } from "@/components/ui/button";
import { Composer } from "@/features/dashboard/components/composer";
import { QuickActions } from "@/features/dashboard/components/quick-actions";

export function DashboardIntro() {
  const { data, isLoading, isError } = useAccounts();
  const needsSetup = !isLoading && !isError && data?.accounts.length === 0;

  return (
    <section className="flex flex-col items-center gap-6 pt-2 sm:gap-8 sm:pt-10">
      {needsSetup ? (
        <div className="border-border bg-card w-full max-w-3xl rounded-3xl border p-4 sm:p-8">
          <div className="bg-muted text-foreground grid size-12 place-items-center rounded-2xl">
            <Plus className="size-6" aria-hidden />
          </div>
          <h1 className="text-foreground mt-4 text-2xl leading-tight font-semibold tracking-tight sm:mt-5 sm:text-3xl">
            Let&rsquo;s connect your YouTube channel
          </h1>
          <p className="text-body mt-3 max-w-2xl text-[15px] leading-relaxed">
            Connect a channel first. Then choose a video, add its details, and publish from your
            dashboard.
          </p>
          <ol className="text-body mt-6 grid gap-3 text-sm sm:grid-cols-2">
            <li className="bg-muted flex items-center gap-3 rounded-2xl px-4 py-3">
              <span className="bg-primary text-primary-foreground grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold">
                1
              </span>
              Connect your YouTube channel
            </li>
            <li className="bg-muted flex items-center gap-3 rounded-2xl px-4 py-3">
              <span className="bg-background text-muted-foreground grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold">
                2
              </span>
              Choose a video and publish
            </li>
          </ol>
          <Button asChild className="mt-6">
            <Link href="/accounts?connect=1">
              Connect YouTube channel <ArrowRight />
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <h1 className="text-foreground text-center text-[34px] leading-tight font-medium tracking-tight sm:text-[40px]">
            What would you like to publish today?
          </h1>
          <Composer />
        </>
      )}
      <QuickActions />
    </section>
  );
}
