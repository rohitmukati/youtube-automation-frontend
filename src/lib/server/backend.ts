import type { NextResponse } from "next/server";
import { REFRESH_COOKIE, REFRESH_COOKIE_MAX_AGE_SECONDS } from "@/config/constants";
import { env } from "@/config/env";
import type { ApiErrorBody } from "@/types/api";

interface BackendResult<T> {
  ok: boolean;
  status: number;
  data: T | ApiErrorBody | null;
}

export function errorBody(code: string, message: string): ApiErrorBody {
  return { success: false, error: { code, message } };
}

export async function callBackend<T>(path: string, body?: unknown): Promise<BackendResult<T>> {
  try {
    const response = await fetch(`${env.apiUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(env.skipNgrokWarning ? { "ngrok-skip-browser-warning": "true" } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    const data = (await response.json().catch(() => null)) as T | ApiErrorBody | null;
    return { ok: response.ok, status: response.status, data };
  } catch {
    return {
      ok: false,
      status: 502,
      data: errorBody(
        "service_unreachable",
        "We could not reach the server. Check your connection and try again.",
      ),
    };
  }
}

export function setRefreshCookie(response: NextResponse, token: string) {
  response.cookies.set(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_COOKIE_MAX_AGE_SECONDS,
  });
}

export function clearRefreshCookie(response: NextResponse) {
  response.cookies.set(REFRESH_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
