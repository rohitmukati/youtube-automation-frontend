import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { SessionProvider } from "@/features/auth/session-provider";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AppShell>{children}</AppShell>
    </SessionProvider>
  );
}
