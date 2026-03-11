import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySignedSessionToken } from "@/lib/auth/session";
import { evaluatePrivateBetaAccess } from "@/lib/beta/private-beta";
import { resolveLaunchMode } from "@/lib/beta/launch-mode";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySignedSessionToken(token);
  const launchMode = resolveLaunchMode();
  const betaEnabled = launchMode !== "OPEN";

  if (!session) {
    return NextResponse.json(
      {
        launchMode,
        betaEnabled,
        authenticated: false,
        allowed: !betaEnabled,
        reasonCode: betaEnabled ? "UNAUTHENTICATED" : "BETA_DISABLED"
      },
      {
        status: 200,
        headers: {
          "cache-control": "no-store"
        }
      }
    );
  }

  const access = evaluatePrivateBetaAccess(session);

  return NextResponse.json(
    {
      launchMode,
      betaEnabled,
      authenticated: true,
      role: session.role,
      email: session.email,
      schoolSlug: session.schoolSlug,
      allowed: access.allowed,
      reasonCode: access.reasonCode
    },
    {
      status: 200,
      headers: {
        "cache-control": "no-store"
      }
    }
  );
}
