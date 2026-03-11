import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  APP_ROLE_PARENT,
  APP_ROLE_SCHOOL_ADMIN,
  LEGACY_SESSION_ROLE_COOKIE,
  normalizeSessionRole,
  SESSION_COOKIE,
  SESSION_ROLE_PARENT,
  SESSION_ROLE_SCHOOL,
  verifySignedAdminSessionToken,
  verifySignedSessionToken
} from "@/lib/auth/session";
import { evaluatePrivateBetaAccess, PRIVATE_BETA_ACCESS_PATH } from "@/lib/beta/private-beta";
import { assertCriticalWebEnv } from "@/lib/env/critical";

const SIGN_IN_PATH = "/ingresar";

function redirectToSignIn(request: NextRequest, nextPath?: string) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = SIGN_IN_PATH;
  redirectUrl.search = "";

  if (nextPath) {
    redirectUrl.searchParams.set("next", nextPath);
  }

  return NextResponse.redirect(redirectUrl);
}

function buildRequestPath(request: NextRequest) {
  return request.nextUrl.search ? `${request.nextUrl.pathname}${request.nextUrl.search}` : request.nextUrl.pathname;
}

function redirectToPrivateBetaAccess(request: NextRequest, nextPath: string, reasonCode: string) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = PRIVATE_BETA_ACCESS_PATH;
  redirectUrl.search = "";
  redirectUrl.searchParams.set("next", nextPath);
  redirectUrl.searchParams.set("reason", reasonCode.toLowerCase());
  return NextResponse.redirect(redirectUrl);
}

async function resolveSession(request: NextRequest) {
  const signed = request.cookies.get(SESSION_COOKIE)?.value;
  const verified = await verifySignedSessionToken(signed);
  if (verified) {
    return verified;
  }

  const legacyRole = normalizeSessionRole(request.cookies.get(LEGACY_SESSION_ROLE_COOKIE)?.value);
  if (legacyRole === SESSION_ROLE_PARENT) {
    return {
      userId: "legacy-parent",
      email: "legacy@local",
      role: APP_ROLE_PARENT,
      schoolId: null,
      schoolSlug: null,
      issuedAt: Date.now(),
      expiresAt: Date.now() + 60_000
    };
  }

  if (legacyRole === SESSION_ROLE_SCHOOL) {
    return {
      userId: "legacy-school",
      email: "legacy@local",
      role: APP_ROLE_SCHOOL_ADMIN,
      schoolId: null,
      schoolSlug: null,
      issuedAt: Date.now(),
      expiresAt: Date.now() + 60_000
    };
  }

  return null;
}

function enforceSchoolScope(request: NextRequest, schoolSlug: string | null) {
  if (!schoolSlug) {
    return null;
  }

  const current = request.nextUrl.searchParams.get("school")?.trim().toLowerCase() ?? null;
  if (current === schoolSlug) {
    return null;
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.searchParams.set("school", schoolSlug);
  return NextResponse.redirect(redirectUrl);
}

export async function middleware(request: NextRequest) {
  assertCriticalWebEnv();

  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/parent-dashboard")) {
    const session = await resolveSession(request);
    if (!session || session.role !== APP_ROLE_PARENT) {
      return redirectToSignIn(request, buildRequestPath(request));
    }

    const betaAccess = evaluatePrivateBetaAccess(session);
    if (!betaAccess.allowed) {
      return redirectToPrivateBetaAccess(request, buildRequestPath(request), betaAccess.reasonCode);
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/school-dashboard")) {
    const session = await resolveSession(request);
    if (!session || session.role !== APP_ROLE_SCHOOL_ADMIN || !session.schoolSlug) {
      return redirectToSignIn(request, buildRequestPath(request));
    }

    const betaAccess = evaluatePrivateBetaAccess(session);
    if (!betaAccess.allowed) {
      return redirectToPrivateBetaAccess(request, buildRequestPath(request), betaAccess.reasonCode);
    }

    const schoolScopeRedirect = enforceSchoolScope(request, session.schoolSlug);
    if (schoolScopeRedirect) {
      return schoolScopeRedirect;
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const currentSession = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const adminSession = await verifySignedAdminSessionToken(currentSession);
    if (adminSession) {
      return NextResponse.next();
    }

    return redirectToSignIn(request, buildRequestPath(request));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/parent-dashboard/:path*", "/school-dashboard/:path*"]
};
