"use client";

import { Button } from "@/components/ui/button";
import { Orb } from "@/components/ui/orb";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="grid min-h-dvh place-items-center px-6">
      <div className="flex max-w-md flex-col items-center gap-5 text-center">
        <Orb size={64} variant="sunset" />
        <h1 className="text-foreground text-3xl font-medium tracking-tight">
          Something went wrong
        </h1>
        <p className="text-muted-foreground text-[15px]">
          An unexpected error stopped this page from loading. Try again, and contact support if it
          keeps happening.
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
