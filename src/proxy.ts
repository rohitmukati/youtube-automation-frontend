import { NextResponse, type NextRequest } from "next/server";
import { AUTH_ROUTES, PROTECTED_PREFIXES, REFRESH_COOKIE } from "@/config/constants";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.has(REFRESH_COOKIE);

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isAuthRoute = (AUTH_ROUTES as readonly string[]).includes(pathname);

  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && hasSession && pathname !== "/reset-password") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/accounts/:path*",
    "/storage/:path*",
    "/uploads/:path*",
    "/settings/:path*",
    "/youtube/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ],
};
