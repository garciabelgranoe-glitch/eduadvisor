import { NextRequest, NextResponse } from "next/server";
import {
  buildAuthCookieOptions,
  buildExpiredAuthCookieOptions,
  buildDashboardPathForSession,
  createAuthSession,
  createSignedSessionToken,
  dashboardPathForRole,
  LEGACY_SESSION_ROLE_COOKIE,
  normalizeSessionRole,
  SESSION_COOKIE,
  SESSION_ROLE_PARENT,
  SESSION_ROLE_SCHOOL,
  type SessionRole
} from "@/lib/auth/session";
import { consumeRateLimit } from "@/lib/security/in-memory-rate-limit";

const API_BASE = process.env.API_URL?.trim() || "http://localhost:4000";
const RATE_LIMIT_MAX_REQUESTS = 8;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_BLOCK_MS = 10 * 60_000;

type ApiRole = "PARENT" | "SCHOOL_ADMIN";
const SCHOOL_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
type SchoolAuthErrorCode =
  | "SCHOOL_NOT_VERIFIED"
  | "CLAIM_REQUIRED"
  | "CLAIM_PENDING"
  | "CLAIM_UNDER_REVIEW"
  | "CLAIM_REJECTED"
  | "SCHOOL_NOT_FOUND";

function sanitizeNextPath(value: string | undefined, fallback: string, role: SessionRole) {
  if (!value) {
    return fallback;
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  if (
    role === SESSION_ROLE_PARENT &&
    (value.startsWith("/api") ||
      value.startsWith("/admin") ||
      value.startsWith("/ingresar") ||
      value.startsWith("/school-dashboard"))
  ) {
    return fallback;
  }

  if (role === SESSION_ROLE_SCHOOL && !value.startsWith("/school-dashboard")) {
    return fallback;
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

function buildErrorRedirect(request: NextRequest, code: string) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/ingresar";
  redirectUrl.search = "";
  redirectUrl.searchParams.set("error", code);
  return NextResponse.redirect(redirectUrl, { status: 303 });
}

function sanitizeEmail(value: string | undefined) {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (!normalized || !normalized.includes("@")) {
    return null;
  }

  return normalized;
}

function sanitizeSchoolSlug(value: string | undefined) {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized.length === 0 || normalized.length > 120) {
    return null;
  }

  return SCHOOL_SLUG_PATTERN.test(normalized) ? normalized : null;
}

function validateAccessCode(role: SessionRole, accessCode: string | undefined) {
  const expectedCode =
    role === SESSION_ROLE_PARENT
      ? process.env.AUTH_PARENT_ACCESS_CODE?.trim()
      : process.env.AUTH_SCHOOL_ACCESS_CODE?.trim();

  if (!expectedCode) {
    return true;
  }

  return accessCode?.trim() === expectedCode;
}

async function parseRolePayload(
  request: NextRequest
): Promise<{ role: SessionRole | null; nextPath?: string; email?: string; schoolSlug?: string; accessCode?: string }> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => null);
    return {
      role: normalizeSessionRole(body?.role),
      nextPath: typeof body?.next === "string" ? body.next : undefined,
      email: typeof body?.email === "string" ? body.email : undefined,
      schoolSlug: typeof body?.schoolSlug === "string" ? body.schoolSlug : undefined,
      accessCode: typeof body?.accessCode === "string" ? body.accessCode : undefined
    };
  }

  const formData = await request.formData();
  return {
    role: normalizeSessionRole(formData.get("role")?.toString()),
    nextPath: formData.get("next")?.toString(),
    email: formData.get("email")?.toString(),
    schoolSlug: formData.get("schoolSlug")?.toString(),
    accessCode: formData.get("accessCode")?.toString()
  };
}

function mapRoleToApiRole(role: SessionRole): ApiRole {
  return role === SESSION_ROLE_PARENT ? "PARENT" : "SCHOOL_ADMIN";
}

function extractErrorCode(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const value = payload as Record<string, unknown>;

  if (typeof value.code === "string") {
    return value.code;
  }

  if (value.message && typeof value.message === "object") {
    const nested = value.message as Record<string, unknown>;
    if (typeof nested.code === "string") {
      return nested.code;
    }
  }

  return null;
}

function mapSchoolErrorToUiCode(errorCode: string | null) {
  const normalized = (errorCode ?? "").trim().toUpperCase() as SchoolAuthErrorCode;

  if (normalized === "SCHOOL_NOT_VERIFIED") {
    return "school_not_verified";
  }

  if (normalized === "CLAIM_REQUIRED" || normalized === "SCHOOL_NOT_FOUND") {
    return "claim_required";
  }

  if (normalized === "CLAIM_PENDING" || normalized === "CLAIM_UNDER_REVIEW") {
    return "claim_pending";
  }

  if (normalized === "CLAIM_REJECTED") {
    return "claim_rejected";
  }

  return "credentials";
}

function isJsonRequest(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  return contentType.includes("application/json");
}

function getClientIp(request: NextRequest) {
  const ipHeader = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";
  return ipHeader.split(",")[0]?.trim() || "unknown";
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = consumeRateLimit({
    key: `session-role-login:${clientIp}`,
    maxRequests: RATE_LIMIT_MAX_REQUESTS,
    windowMs: RATE_LIMIT_WINDOW_MS,
    blockMs: RATE_LIMIT_BLOCK_MS
  });
  if (!rateLimit.allowed) {
    const retryAfterSeconds = Math.max(1, Math.ceil(rateLimit.retryAfterMs / 1000));
    if (isJsonRequest(request)) {
      return NextResponse.json(
        {
          message: "Demasiados intentos de inicio de sesión. Intenta nuevamente en unos minutos.",
          code: "RATE_LIMIT"
        },
        {
          status: 429,
          headers: {
            "cache-control": "no-store",
            "retry-after": String(retryAfterSeconds)
          }
        }
      );
    }

    const redirect = buildErrorRedirect(request, "rate_limit");
    redirect.headers.set("retry-after", String(retryAfterSeconds));
    return redirect;
  }

  const { role, nextPath, email, schoolSlug, accessCode } = await parseRolePayload(request);
  if (!role) {
    return buildErrorRedirect(request, "role");
  }

  const normalizedEmail = sanitizeEmail(email);
  if (!normalizedEmail) {
    return buildErrorRedirect(request, "email");
  }

  if (!validateAccessCode(role, accessCode)) {
    return buildErrorRedirect(request, "code");
  }

  const normalizedSchoolSlug = sanitizeSchoolSlug(schoolSlug);
  if (role === SESSION_ROLE_SCHOOL && !normalizedSchoolSlug) {
    return buildErrorRedirect(request, "school");
  }

  const adminApiKey = process.env.ADMIN_API_KEY?.trim();
  if (!adminApiKey) {
    return buildErrorRedirect(request, "session");
  }

  const apiRole = mapRoleToApiRole(role);

  const authResponse = await fetch(`${API_BASE}/v1/auth/session`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-admin-key": adminApiKey
    },
    body: JSON.stringify({
      email: normalizedEmail,
      role: apiRole,
      schoolSlug: apiRole === "SCHOOL_ADMIN" ? normalizedSchoolSlug : undefined
    }),
    cache: "no-store"
  }).catch(() => null);

  if (!authResponse || !authResponse.ok) {
    const errorPayload = authResponse ? await authResponse.json().catch(() => null) : null;
    const backendErrorCode = extractErrorCode(errorPayload);
    const uiCode = role === SESSION_ROLE_SCHOOL ? mapSchoolErrorToUiCode(backendErrorCode) : "credentials";
    return buildErrorRedirect(request, uiCode);
  }

  const payload = (await authResponse.json().catch(() => null)) as
    | {
        user?: {
          id?: string;
          email?: string;
          role?: "PARENT" | "SCHOOL_ADMIN";
        };
        scope?: {
          schoolId?: string;
          schoolSlug?: string;
        } | null;
      }
    | null;

  const userId = payload?.user?.id ?? null;
  const userEmail = payload?.user?.email ?? normalizedEmail;

  if (!userId || !payload?.user?.role) {
    return buildErrorRedirect(request, "credentials");
  }

  const session = await createAuthSession({
    userId,
    email: userEmail,
    role: payload.user.role,
    schoolId: payload.scope?.schoolId ?? null,
    schoolSlug: payload.scope?.schoolSlug ?? null
  });

  const token = await createSignedSessionToken(session);
  if (!token) {
    return buildErrorRedirect(request, "session");
  }

  const defaultDashboard = buildDashboardPathForSession(session);
  const fallbackPath = role === SESSION_ROLE_PARENT ? dashboardPathForRole(SESSION_ROLE_PARENT) : defaultDashboard;
  const safeNextPath = sanitizeNextPath(nextPath, fallbackPath, role);
  const response = NextResponse.redirect(buildRedirectUrl(request, safeNextPath), { status: 303 });

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
