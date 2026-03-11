import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  buildAuthCookieOptions,
  createAdminSession,
  createSignedAdminSessionToken,
  getExpectedAdminAccessCode,
  isAdminIdentityAllowed,
  normalizeAdminIdentityEmail,
  resolveAdminSessionTtlSeconds
} from "@/lib/auth/session";
import { consumeRateLimit } from "@/lib/security/in-memory-rate-limit";

const FALLBACK_ADMIN_PATH = "/admin";
const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_BLOCK_MS = 15 * 60_000;
const LOCAL_NODE_ENVS = new Set(["development", "test"]);

function sanitizeNextPath(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return FALLBACK_ADMIN_PATH;
  }

  if (!value.startsWith("/admin")) {
    return FALLBACK_ADMIN_PATH;
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

function buildSignInRedirect(request: NextRequest, nextPath: string, errorCode: string) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/ingresar";
  redirectUrl.search = "";
  redirectUrl.searchParams.set("next", nextPath);
  redirectUrl.searchParams.set("error", errorCode);
  return NextResponse.redirect(redirectUrl, { status: 303 });
}

function buildGoogleAdminStartRedirect(request: NextRequest, nextPath: string) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/api/session/google/start";
  redirectUrl.search = "";
  redirectUrl.searchParams.set("intent", "admin");
  redirectUrl.searchParams.set("next", nextPath);
  return NextResponse.redirect(redirectUrl, { status: 303 });
}

function isJsonRequest(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  return contentType.includes("application/json");
}

function getClientIp(request: NextRequest) {
  const ipHeader = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";
  return ipHeader.split(",")[0]?.trim() || "unknown";
}

async function parsePayload(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => null);
    return {
      email: typeof body?.email === "string" ? body.email : undefined,
      accessCode: typeof body?.accessCode === "string" ? body.accessCode : undefined,
      next: typeof body?.next === "string" ? body.next : undefined
    };
  }

  const formData = await request.formData();
  return {
    email: formData.get("email")?.toString(),
    accessCode: formData.get("accessCode")?.toString(),
    next: formData.get("next")?.toString()
  };
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = consumeRateLimit({
    key: `session-admin-login:${clientIp}`,
    maxRequests: RATE_LIMIT_MAX_REQUESTS,
    windowMs: RATE_LIMIT_WINDOW_MS,
    blockMs: RATE_LIMIT_BLOCK_MS
  });

  if (!rateLimit.allowed) {
    const retryAfterSeconds = Math.max(1, Math.ceil(rateLimit.retryAfterMs / 1000));
    if (isJsonRequest(request)) {
      return NextResponse.json(
        {
          message: "Demasiados intentos de acceso admin. Intenta nuevamente en unos minutos.",
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

    const redirect = buildSignInRedirect(request, FALLBACK_ADMIN_PATH, "rate_limit");
    redirect.headers.set("retry-after", String(retryAfterSeconds));
    return redirect;
  }

  const payload = await parsePayload(request);
  const safeNextPath = sanitizeNextPath(payload.next);

  const isLocalRuntime = LOCAL_NODE_ENVS.has(process.env.NODE_ENV ?? "development");
  if (!isLocalRuntime) {
    if (isJsonRequest(request)) {
      return NextResponse.json(
        {
          message: "Admin sign-in requires Google identity flow.",
          code: "ADMIN_USE_GOOGLE",
          redirectTo: `/api/session/google/start?intent=admin&next=${encodeURIComponent(safeNextPath)}`
        },
        {
          status: 409,
          headers: {
            "cache-control": "no-store"
          }
        }
      );
    }

    return buildGoogleAdminStartRedirect(request, safeNextPath);
  }

  const expectedToken = getExpectedAdminAccessCode();

  if (!expectedToken) {
    return buildSignInRedirect(request, safeNextPath, "admin_unavailable");
  }

  const normalizedEmail = normalizeAdminIdentityEmail(payload.email);
  if (!normalizedEmail) {
    return buildSignInRedirect(request, safeNextPath, "admin_email");
  }

  const incomingCode = payload.accessCode?.trim() ?? "";
  if (!incomingCode || incomingCode !== expectedToken || !isAdminIdentityAllowed(normalizedEmail)) {
    return buildSignInRedirect(request, safeNextPath, "admin_code");
  }

  const session = await createAdminSession({
    email: normalizedEmail
  });

  if (!session) {
    return buildSignInRedirect(request, safeNextPath, "admin_unavailable");
  }

  const signedSession = await createSignedAdminSessionToken(session);
  if (!signedSession) {
    return buildSignInRedirect(request, safeNextPath, "admin_unavailable");
  }

  const response = NextResponse.redirect(buildRedirectUrl(request, safeNextPath), { status: 303 });
  response.cookies.set(
    ADMIN_SESSION_COOKIE,
    signedSession,
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
