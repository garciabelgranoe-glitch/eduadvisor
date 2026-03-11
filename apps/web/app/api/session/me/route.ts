import { NextRequest, NextResponse } from "next/server";
import {
  buildAuthCookieOptions,
  buildDashboardRouteForSession,
  createSignedSessionToken,
  dashboardPathForRole,
  LEGACY_SESSION_ROLE_COOKIE,
  normalizeSessionRole,
  renewAuthSession,
  SESSION_COOKIE,
  shouldRenewSession,
  toUiSessionRole,
  verifySignedSessionToken
} from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const signed = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySignedSessionToken(signed);

  if (session) {
    const response = NextResponse.json(
      {
        authenticated: true,
        role: toUiSessionRole(session.role),
        appRole: session.role,
        email: session.email,
        schoolSlug: session.schoolSlug,
        schoolId: session.schoolId,
        dashboardPath: buildDashboardRouteForSession(session)
      },
      {
        headers: {
          "cache-control": "no-store"
        }
      }
    );

    if (shouldRenewSession(session)) {
      const renewedSession = renewAuthSession(session);
      const refreshedToken = await createSignedSessionToken(renewedSession);
      if (refreshedToken) {
        response.cookies.set(
          SESSION_COOKIE,
          refreshedToken,
          buildAuthCookieOptions({
            requestProtocol: request.nextUrl.protocol,
            requestHostname: request.nextUrl.hostname,
            path: "/",
            maxAge: Math.max(Math.floor((renewedSession.expiresAt - Date.now()) / 1000), 1)
          })
        );
      }
    }

    return response;
  }

  const legacyRole = normalizeSessionRole(request.cookies.get(LEGACY_SESSION_ROLE_COOKIE)?.value);

  return NextResponse.json(
    {
      authenticated: false,
      role: legacyRole,
      appRole: null,
      email: null,
      schoolSlug: null,
      schoolId: null,
      dashboardPath: legacyRole ? dashboardPathForRole(legacyRole) : null
    },
    {
      headers: {
        "cache-control": "no-store"
      }
    }
  );
}
