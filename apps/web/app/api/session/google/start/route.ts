import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  buildAuthCookieOptions,
  GOOGLE_OAUTH_INTENT_COOKIE,
  GOOGLE_OAUTH_NEXT_COOKIE,
  GOOGLE_OAUTH_STATE_COOKIE,
  getOauthTransientCookieTtlSeconds
} from "@/lib/auth/session";

type OauthIntent = "parent" | "admin";

function parseIntent(value: string | null): OauthIntent {
  return value === "admin" ? "admin" : "parent";
}

function sanitizeParentNextPath(value: string | null, fallback: string) {
  if (!value) {
    return fallback;
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  if (
    value.startsWith("/api") ||
    value.startsWith("/admin") ||
    value.startsWith("/ingresar") ||
    value.startsWith("/school-dashboard")
  ) {
    return fallback;
  }

  return value;
}

function sanitizeAdminNextPath(value: string | null, fallback: string) {
  if (!value) {
    return fallback;
  }

  if (!value.startsWith("/admin") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}

function buildSignInErrorRedirect(request: NextRequest, code: string, intent: OauthIntent) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/ingresar";
  redirectUrl.search = "";
  redirectUrl.searchParams.set("error", code);
  if (intent === "admin") {
    redirectUrl.searchParams.set("admin", "1");
  }
  return NextResponse.redirect(redirectUrl, { status: 303 });
}

export async function GET(request: NextRequest) {
  const intent = parseIntent(request.nextUrl.searchParams.get("intent"));
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim();
  if (!clientId) {
    return buildSignInErrorRedirect(request, "google_unavailable", intent);
  }

  const fallbackNext = intent === "admin" ? "/admin" : "/parent-dashboard";
  const requestedNext = request.nextUrl.searchParams.get("next");
  const safeNext =
    intent === "admin"
      ? sanitizeAdminNextPath(requestedNext, fallbackNext)
      : sanitizeParentNextPath(requestedNext, fallbackNext);
  const state = randomUUID();
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI?.trim() || `${request.nextUrl.origin}/api/session/google/callback`;

  const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleUrl.searchParams.set("client_id", clientId);
  googleUrl.searchParams.set("redirect_uri", redirectUri);
  googleUrl.searchParams.set("response_type", "code");
  googleUrl.searchParams.set("scope", "openid email profile");
  googleUrl.searchParams.set("prompt", "select_account");
  googleUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(googleUrl, { status: 303 });
  const cookieTtl = getOauthTransientCookieTtlSeconds();

  response.cookies.set(
    GOOGLE_OAUTH_STATE_COOKIE,
    state,
    buildAuthCookieOptions({
      requestProtocol: request.nextUrl.protocol,
      requestHostname: request.nextUrl.hostname,
      path: "/",
      maxAge: cookieTtl
    })
  );
  response.cookies.set(
    GOOGLE_OAUTH_NEXT_COOKIE,
    safeNext,
    buildAuthCookieOptions({
      requestProtocol: request.nextUrl.protocol,
      requestHostname: request.nextUrl.hostname,
      path: "/",
      maxAge: cookieTtl
    })
  );
  response.cookies.set(
    GOOGLE_OAUTH_INTENT_COOKIE,
    intent,
    buildAuthCookieOptions({
      requestProtocol: request.nextUrl.protocol,
      requestHostname: request.nextUrl.hostname,
      path: "/",
      maxAge: cookieTtl
    })
  );

  return response;
}
