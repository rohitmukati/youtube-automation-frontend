import { handleAuthEntry } from "@/lib/server/auth-entry";

export const dynamic = "force-dynamic";

export function POST(request: Request) {
  return handleAuthEntry(request, "/auth/login");
}
