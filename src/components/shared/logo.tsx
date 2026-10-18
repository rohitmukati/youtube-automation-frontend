import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "bg-primary text-primary-foreground grid size-8 place-items-center rounded-[10px]",
        className,
      )}
    >
      <svg viewBox="0 0 20 20" className="size-4" fill="currentColor">
        <rect x="3" y="7" width="3" height="6" rx="1.5" />
        <rect x="8.5" y="3" width="3" height="14" rx="1.5" />
        <rect x="14" y="6" width="3" height="8" rx="1.5" />
      </svg>
    </span>
  );
}

interface LogoProps {
  href?: string;
  className?: string;
  showName?: boolean;
}

export function Logo({ href = "/", className, showName = true }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2.5 rounded-lg", className)}
      aria-label={siteConfig.name}
    >
      <LogoMark />
      {showName ? (
        <span className="text-foreground text-[17px] font-semibold tracking-tight">
          {siteConfig.name}
        </span>
      ) : null}
    </Link>
  );
}
