import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Orb } from "@/components/ui/orb";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col px-6 py-6">
      <Logo />
      <main
        id="main"
        className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-5 text-center"
      >
        <Orb size={64} variant="bloom" />
        <h1 className="text-foreground text-3xl font-medium tracking-tight">
          This page does not exist
        </h1>
        <p className="text-muted-foreground text-[15px]">
          The link may be broken, or the page may have moved.
        </p>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/dashboard">Go to Home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Back to website</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
