import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  buildExpiredAuthCookieOptions,
  GOOGLE_OAUTH_INTENT_COOKIE,
  GOOGLE_OAUTH_NEXT_COOKIE,
  GOOGLE_OAUTH_STATE_COOKIE,
  LEGACY_SESSION_ROLE_COOKIE,
  SESSION_COOKIE
} from "@/lib/auth/session";

function sanitizeNextPath(value: string | undefined) {
  if (!value) {
    return "/";
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

function buildRedirectUrl(request: NextRequest, nextPath: string) {
  const target = new URL(nextPath, request.nextUrl.origin);
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = target.pathname;
  redirectUrl.search = target.search;
  return redirectUrl;
}

async function parseNextPath(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => null);
    return typeof body?.next === "string" ? body.next : undefined;
  }

  const formData = await request.formData();
  return formData.get("next")?.toString();
}

export async function POST(request: NextRequest) {
  const nextPath = sanitizeNextPath(await parseNextPath(request));
  const response = NextResponse.redirect(buildRedirectUrl(request, nextPath), { status: 303 });

  response.cookies.set(
    SESSION_COOKIE,
    "",
    buildExpiredAuthCookieOptions(request.nextUrl.protocol, "/", "lax", request.nextUrl.hostname)
  );
  response.cookies.set(
    LEGACY_SESSION_ROLE_COOKIE,
    "",
    buildExpiredAuthCookieOptions(request.nextUrl.protocol, "/", "lax", request.nextUrl.hostname)
  );
  response.cookies.set(
    ADMIN_SESSION_COOKIE,
    "",
    buildExpiredAuthCookieOptions(request.nextUrl.protocol, "/", "strict", request.nextUrl.hostname)
  );
  // Backward compatibility: remove legacy admin cookie scoped to /admin.
  response.cookies.set(
    ADMIN_SESSION_COOKIE,
    "",
    buildExpiredAuthCookieOptions(request.nextUrl.protocol, "/admin", "strict", request.nextUrl.hostname)
  );
  response.cookies.set(
    GOOGLE_OAUTH_STATE_COOKIE,
    "",
    buildExpiredAuthCookieOptions(request.nextUrl.protocol, "/", "lax", request.nextUrl.hostname)
  );
  response.cookies.set(
    GOOGLE_OAUTH_NEXT_COOKIE,
    "",
    buildExpiredAuthCookieOptions(request.nextUrl.protocol, "/", "lax", request.nextUrl.hostname)
  );
  response.cookies.set(
    GOOGLE_OAUTH_INTENT_COOKIE,
    "",
    buildExpiredAuthCookieOptions(request.nextUrl.protocol, "/", "lax", request.nextUrl.hostname)
  );

  return response;
}
