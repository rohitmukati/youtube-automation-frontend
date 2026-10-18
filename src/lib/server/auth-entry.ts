import { NextResponse } from "next/server";
import { callBackend, errorBody, setRefreshCookie } from "@/lib/server/backend";
import type { AuthResponse, SessionPayload } from "@/types/api";

export async function handleAuthEntry(request: Request, path: "/auth/login" | "/auth/signup") {
  const payload = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!payload || typeof payload !== "object") {
    return NextResponse.json(errorBody("invalid_request", "The request could not be read."), {
      status: 400,
    });
  }

  const result = await callBackend<AuthResponse>(path, payload);
  if (!result.ok || !result.data || !("tokens" in result.data)) {
    return NextResponse.json(
      result.data ?? errorBody("unexpected_error", "Something went wrong. Please try again."),
      { status: result.ok ? 502 : result.status },
    );
  }

  const { user, tokens } = result.data;
  const body: SessionPayload = {
    user,
    accessToken: tokens.access_token,
    expiresIn: tokens.expires_in,
  };
  const response = NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
  setRefreshCookie(response, tokens.refresh_token);
  return response;
}
