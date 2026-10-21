"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { env } from "@/config/env";
import { useSession } from "@/features/auth/session-provider";
import { publicApi } from "@/lib/api/client";
import { useMounted } from "@/hooks/use-mounted";
import { formatDate } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className="text-foreground min-w-0 truncate text-sm">{children}</dd>
    </div>
  );
}

function ServiceStatus() {
  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.health,
    queryFn: async () => {
      const origin = new URL(env.apiUrl).origin;
      await publicApi.get(`${origin}/health/ready`, { timeout: 8000 });
      return true;
    },
    staleTime: 60_000,
    retry: false,
  });

  if (isLoading) return <Badge>Checking</Badge>;
  return data && !isError ? (
    <Badge tone="success" dot>
      Operational
    </Badge>
  ) : (
    <Badge tone="danger" dot>
      Unavailable
    </Badge>
  );
}

export function SettingsView() {
  const { user, logout } = useSession();
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const [loggingOut, setLoggingOut] = React.useState(false);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <PageHeader title="Settings" description="Your profile, appearance and session." />

      <Card>
        <CardHeader title="Profile" />
        <CardBody>
          <div className="mb-6 flex items-center gap-4">
            <Avatar name={user.name} size={56} />
            <div className="min-w-0">
              <p className="text-foreground truncate text-base font-medium">{user.name}</p>
              <p className="text-muted-foreground truncate text-sm">{user.email}</p>
            </div>
          </div>
          <dl className="divide-border divide-y">
            <Row label="Full name">{user.name}</Row>
            <Row label="Email">{user.email}</Row>
            <Row label="Phone">{user.phone ?? "Not provided"}</Row>
            <Row label="Member since">{formatDate(user.created_at)}</Row>
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Appearance" description="Choose how the app looks on this device." />
        <CardBody>
          {mounted ? (
            <SegmentedControl
              label="Theme"
              value={(theme as "light" | "dark") ?? "light"}
              onChange={setTheme}
              options={[
                { value: "light", label: "Light", icon: <Sun /> },
                { value: "dark", label: "Dark", icon: <Moon /> },
              ]}
            />
          ) : (
            <div className="h-10" />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Service" />
        <CardBody>
          <dl className="divide-border divide-y">
            <Row label="Backend status">
              <ServiceStatus />
            </Row>
            <Row label="Legal">
              <span className="flex gap-4">
                <Link
                  href="/terms"
                  className="hover:text-muted-foreground underline underline-offset-4"
                >
                  Terms
                </Link>
                <Link
                  href="/privacy"
                  className="hover:text-muted-foreground underline underline-offset-4"
                >
                  Privacy
                </Link>
              </span>
            </Row>
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Session"
          description="Log out of this device. Other devices stay signed in."
        />
        <CardBody>
          <Button
            variant="outline"
            loading={loggingOut}
            onClick={() => {
              setLoggingOut(true);
              void logout();
            }}
          >
            <LogOut /> Log out
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
