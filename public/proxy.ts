import { NextRequest, NextResponse } from "next/server";
import {
  ACTIVE_SESSION_COOKIE,
  SESSION_IDS_COOKIE,
} from "@/lib/auth/session-cookies";

function parseSessionIds(value: string | undefined) {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

export function proxy(request: NextRequest) {
  const activeSessionId = request.cookies.get(ACTIVE_SESSION_COOKIE)?.value;
  const sessionIds = parseSessionIds(request.cookies.get(SESSION_IDS_COOKIE)?.value);

  if (!activeSessionId || !sessionIds.includes(activeSessionId)) {
    const loginUrl = new URL("/authentication/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/home/:path*", "/pages/:path*"],
};
