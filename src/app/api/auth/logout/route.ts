import { NextResponse, type NextRequest } from "next/server";
import { REFRESH_COOKIE } from "@/config/constants";
import { callBackend, clearRefreshCookie } from "@/lib/server/backend";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (refreshToken) {
    await callBackend("/auth/logout", { refresh_token: refreshToken });
  }
  const response = NextResponse.json({ message: "Logged out." });
  clearRefreshCookie(response);
  return response;
}
