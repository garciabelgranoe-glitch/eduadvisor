import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  APP_ROLE_PARENT,
  buildAuthCookieOptions,
  buildExpiredAuthCookieOptions,
  createAdminSession,
  createAuthSession,
  createSignedAdminSessionToken,
  createSignedSessionToken,
  GOOGLE_OAUTH_INTENT_COOKIE,
  GOOGLE_OAUTH_NEXT_COOKIE,
  GOOGLE_OAUTH_STATE_COOKIE,
  isAdminIdentityAllowed,
  LEGACY_SESSION_ROLE_COOKIE,
  resolveAdminSessionTtlSeconds,
  SESSION_COOKIE
} from "@/lib/auth/session";

const API_BASE = process.env.API_URL ?? "http://localhost:4000";
type OauthIntent = "parent" | "admin";

function parseIntent(value: string | undefined): OauthIntent {
  return value === "admin" ? "admin" : "parent";
}

function sanitizeParentNextPath(value: string | undefined, fallback: string) {
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

function sanitizeAdminNextPath(value: string | undefined, fallback: string) {
  if (!value) {
    return fallback;
  }

  if (!value.startsWith("/admin") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}

function clearOAuthCookies(response: NextResponse, requestProtocol: string, requestHostname: string) {
  response.cookies.set(
    GOOGLE_OAUTH_STATE_COOKIE,
    "",
    buildExpiredAuthCookieOptions(requestProtocol, "/", "lax", requestHostname)
  );
  response.cookies.set(
    GOOGLE_OAUTH_NEXT_COOKIE,
    "",
    buildExpiredAuthCookieOptions(requestProtocol, "/", "lax", requestHostname)
  );
  response.cookies.set(
    GOOGLE_OAUTH_INTENT_COOKIE,
    "",
    buildExpiredAuthCookieOptions(requestProtocol, "/", "lax", requestHostname)
  );
}

function buildSignInErrorRedirect(request: NextRequest, code: string, intent: OauthIntent) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/ingresar";
  redirectUrl.search = "";
  redirectUrl.searchParams.set("error", code);
  if (intent === "admin") {
    redirectUrl.searchParams.set("admin", "1");
  }
  const response = NextResponse.redirect(redirectUrl, { status: 303 });
  clearOAuthCookies(response, request.nextUrl.protocol, request.nextUrl.hostname);
  return response;
}

interface GoogleTokenResponse {
  id_token?: string;
  access_token?: string;
}

interface GoogleTokenInfoResponse {
  email?: string;
  email_verified?: string;
  aud?: string;
  iss?: string;
  exp?: string;
}

export async function GET(request: NextRequest) {
  const intent = parseIntent(request.cookies.get(GOOGLE_OAUTH_INTENT_COOKIE)?.value);
  const oauthError = request.nextUrl.searchParams.get("error");
  if (oauthError) {
    return buildSignInErrorRedirect(request, "google_denied", intent);
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  if (!code || !state) {
    return buildSignInErrorRedirect(request, "google_state", intent);
  }

  const expectedState = request.cookies.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;
  if (!expectedState || expectedState !== state) {
    return buildSignInErrorRedirect(request, "google_state", intent);
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI?.trim() || `${request.nextUrl.origin}/api/session/google/callback`;

  if (!clientId || !clientSecret) {
    return buildSignInErrorRedirect(request, "google_unavailable", intent);
  }

  const tokenBody = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code"
  });

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    },
    body: tokenBody.toString(),
    cache: "no-store"
  }).catch(() => null);

  if (!tokenResponse?.ok) {
    return buildSignInErrorRedirect(request, "google_token", intent);
  }

  const tokenPayload = (await tokenResponse.json().catch(() => null)) as GoogleTokenResponse | null;
  const idToken = tokenPayload?.id_token;
  if (!idToken) {
    return buildSignInErrorRedirect(request, "google_token", intent);
  }

  const tokenInfoResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`, {
    cache: "no-store"
  }).catch(() => null);

  if (!tokenInfoResponse?.ok) {
    return buildSignInErrorRedirect(request, "google_profile", intent);
  }

  const tokenInfo = (await tokenInfoResponse.json().catch(() => null)) as GoogleTokenInfoResponse | null;
  const email = tokenInfo?.email?.trim().toLowerCase();
  const emailVerified = tokenInfo?.email_verified === "true";
  const audienceValid = tokenInfo?.aud === clientId;
  const issuerValid = tokenInfo?.iss === "accounts.google.com" || tokenInfo?.iss === "https://accounts.google.com";

  if (!email || !emailVerified || !audienceValid || !issuerValid) {
    return buildSignInErrorRedirect(request, "google_email", intent);
  }

  if (intent === "admin") {
    if (!isAdminIdentityAllowed(email)) {
      return buildSignInErrorRedirect(request, "admin_not_allowed", intent);
    }

    const adminSession = await createAdminSession({
      email
    });
    const adminToken = adminSession ? await createSignedAdminSessionToken(adminSession) : null;

    if (!adminSession || !adminToken) {
      return buildSignInErrorRedirect(request, "admin_unavailable", intent);
    }

    const safeAdminNext = sanitizeAdminNextPath(request.cookies.get(GOOGLE_OAUTH_NEXT_COOKIE)?.value, "/admin");
    const target = new URL(safeAdminNext, request.nextUrl.origin);
    const response = NextResponse.redirect(target, { status: 303 });
    clearOAuthCookies(response, request.nextUrl.protocol, request.nextUrl.hostname);

    response.cookies.set(
      ADMIN_SESSION_COOKIE,
      adminToken,
      buildAuthCookieOptions({
        requestProtocol: request.nextUrl.protocol,
        requestHostname: request.nextUrl.hostname,
        path: "/",
        maxAge: resolveAdminSessionTtlSeconds(),
        sameSite: "strict"
      })
    );

    return response;
  }

  const adminApiKey = process.env.ADMIN_API_KEY?.trim() ?? "";
  const authResponse = await fetch(`${API_BASE}/v1/auth/session`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-admin-key": adminApiKey
    },
    body: JSON.stringify({
      email,
      role: APP_ROLE_PARENT
    }),
    cache: "no-store"
  }).catch(() => null);

  if (!authResponse?.ok) {
    return buildSignInErrorRedirect(request, "credentials", intent);
  }

  const authPayload = (await authResponse.json().catch(() => null)) as
    | {
        user?: {
          id?: string;
          email?: string;
          role?: "PARENT";
        };
      }
    | null;

  const userId = authPayload?.user?.id ?? null;
  const userEmail = authPayload?.user?.email ?? email;
  if (!userId) {
    return buildSignInErrorRedirect(request, "credentials", intent);
  }

  const session = await createAuthSession({
    userId,
    email: userEmail,
    role: APP_ROLE_PARENT,
    schoolId: null,
    schoolSlug: null
  });
  const token = await createSignedSessionToken(session);
  if (!token) {
    return buildSignInErrorRedirect(request, "session", intent);
  }

  const safeNext = sanitizeParentNextPath(request.cookies.get(GOOGLE_OAUTH_NEXT_COOKIE)?.value, "/parent-dashboard");
  const target = new URL(safeNext, request.nextUrl.origin);
  const response = NextResponse.redirect(target, { status: 303 });

  clearOAuthCookies(response, request.nextUrl.protocol, request.nextUrl.hostname);
  response.cookies.set(
    SESSION_COOKIE,
    token,
    buildAuthCookieOptions({
      requestProtocol: request.nextUrl.protocol,
      requestHostname: request.nextUrl.hostname,
      path: "/",
      maxAge: Math.max(Math.floor((session.expiresAt - Date.now()) / 1000), 1)
    })
  );
  response.cookies.set(
    LEGACY_SESSION_ROLE_COOKIE,
    "",
    buildExpiredAuthCookieOptions(request.nextUrl.protocol, "/", "lax", request.nextUrl.hostname)
  );

  return response;
}
