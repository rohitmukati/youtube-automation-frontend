import Link from "next/link";
import {
  FolderOpen,
  History,
  MonitorPlay,
  RotateCcw,
  Send,
  Upload,
  type LucideIcon,
} from "lucide-react";

const actions: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Publish", href: "/uploads/new", icon: Send },
  { label: "Upload file", href: "/storage?upload=1", icon: Upload },
  { label: "Connect account", href: "/accounts?connect=1", icon: MonitorPlay },
  { label: "Storage", href: "/storage", icon: FolderOpen },
  { label: "Upload history", href: "/uploads", icon: History },
  { label: "Failed uploads", href: "/uploads?status=failed", icon: RotateCcw },
];

export function QuickActions() {
  return (
    <nav
      aria-label="Quick actions"
      className="-mx-4 scrollbar-thin overflow-x-auto px-4 sm:mx-0 sm:px-0"
    >
      <ul className="mx-auto flex w-max min-w-full justify-start gap-3 sm:justify-center sm:gap-6">
        {actions.map(({ label, href, icon: Icon }) => (
          <li key={href}>
            <Link href={href} className="group flex w-24 flex-col items-center gap-2.5 text-center">
              <span className="border-border text-foreground group-hover:bg-muted grid size-14 place-items-center rounded-2xl border transition-colors">
                <Icon className="size-[22px]" strokeWidth={1.6} aria-hidden />
              </span>
              <span className="text-foreground text-sm">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
