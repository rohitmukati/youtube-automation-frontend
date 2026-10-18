import { NextResponse, type NextRequest } from "next/server";
import { REFRESH_COOKIE } from "@/config/constants";
import { callBackend, clearRefreshCookie, errorBody, setRefreshCookie } from "@/lib/server/backend";
import type { RefreshPayload, TokenPair } from "@/types/api";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    return NextResponse.json(
      errorBody("no_session", "Your session has ended. Please log in again."),
      {
        status: 401,
      },
    );
  }

  const result = await callBackend<TokenPair>("/auth/refresh", { refresh_token: refreshToken });

  if (!result.ok || !result.data || !("access_token" in result.data)) {
    const rejected = result.status >= 400 && result.status < 500;
    const response = NextResponse.json(
      result.data ?? errorBody("unexpected_error", "Something went wrong. Please try again."),
      { status: rejected ? 401 : result.status >= 500 ? result.status : 502 },
    );
    if (rejected) clearRefreshCookie(response);
    return response;
  }

  const tokens = result.data;
  const body: RefreshPayload = { accessToken: tokens.access_token, expiresIn: tokens.expires_in };
  const response = NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
  setRefreshCookie(response, tokens.refresh_token);
  return response;
}
