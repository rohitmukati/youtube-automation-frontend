"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authApi } from "@/features/auth/api";
import { toApiError } from "@/lib/api/errors";
import {
  clearSession,
  getSessionUser,
  onSessionExpired,
  refreshAccessToken,
  setSessionUser,
} from "@/lib/auth/session";
import { FullScreenLoader } from "@/components/shared/full-screen-loader";
import { ConnectionError } from "@/components/shared/connection-error";
import type { User } from "@/types/api";

type Status = "loading" | "authenticated" | "unauthenticated" | "error";

interface SessionContextValue {
  user: User;
  logout: () => Promise<void>;
}

const SessionContext = React.createContext<SessionContextValue | null>(null);

export function useSession(): SessionContextValue {
  const context = React.useContext(SessionContext);
  if (!context) throw new Error("useSession must be used inside SessionProvider.");
  return context;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [status, setStatus] = React.useState<Status>(() =>
    getSessionUser() ? "authenticated" : "loading",
  );
  const [user, setUser] = React.useState<User | null>(() => getSessionUser());
  const [loggingOut, setLoggingOut] = React.useState(false);

  React.useEffect(() => {
    if (status !== "loading") return;
    let cancelled = false;

    (async () => {
      try {
        await refreshAccessToken();
        const me = await authApi.me();
        if (cancelled) return;
        setSessionUser(me);
        setUser(me);
        setStatus("authenticated");
      } catch (error) {
        if (cancelled) return;
        const apiError = toApiError(error);
        if (apiError.status === 401 || apiError.status === 403) {
          clearSession();
          setStatus("unauthenticated");
        } else {
          setStatus("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status]);

  React.useEffect(() => {
    return onSessionExpired(() => {
      queryClient.clear();
      setUser(null);
      setStatus("unauthenticated");
      toast.error("Your session has ended. Log in again to continue.");
    });
  }, [queryClient]);

  React.useEffect(() => {
    if (status !== "unauthenticated") return;
    const target = loggingOut ? "/login" : `/login?next=${encodeURIComponent(pathname)}`;
    router.replace(target);
  }, [status, pathname, router, loggingOut]);

  const logout = React.useCallback(async () => {
    setLoggingOut(true);
    try {
      await authApi.logout();
    } catch {
      // The cookie is cleared on the next refresh failure; local state is reset regardless.
    }
    clearSession();
    queryClient.clear();
    setUser(null);
    setStatus("unauthenticated");
  }, [queryClient]);

  const value = React.useMemo<SessionContextValue | null>(
    () => (user ? { user, logout } : null),
    [user, logout],
  );

  if (status === "error") return <ConnectionError onRetry={() => setStatus("loading")} />;
  if (status !== "authenticated" || !value) return <FullScreenLoader />;

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
