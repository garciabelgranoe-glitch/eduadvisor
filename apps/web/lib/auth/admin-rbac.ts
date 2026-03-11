import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifySignedAdminSessionToken } from "@/lib/auth/session";

export type AdminPermission =
  | "schools:write"
  | "claims:write"
  | "subscriptions:write"
  | "reviews:moderate"
  | "billing:checkout"
  | "billing:simulate"
  | "launch:read";

type AdminRole = "PLATFORM_ADMIN";

interface AdminActor {
  adminId: string;
  email: string;
}

const ROLE_PERMISSIONS: Record<AdminRole, Set<AdminPermission>> = {
  PLATFORM_ADMIN: new Set<AdminPermission>([
    "schools:write",
    "claims:write",
    "subscriptions:write",
    "reviews:moderate",
    "billing:checkout",
    "billing:simulate",
    "launch:read"
  ])
};

function jsonNoStore(payload: Record<string, unknown>, status: number) {
  return NextResponse.json(payload, {
    status,
    headers: {
      "cache-control": "no-store"
    }
  });
}

export async function requireAdminPermission(request: NextRequest, permission: AdminPermission) {
  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = await verifySignedAdminSessionToken(sessionToken);
  if (!session) {
    return {
      ok: false as const,
      response: jsonNoStore({ message: "Unauthorized" }, 401)
    };
  }

  const role: AdminRole = session.role;
  if (!ROLE_PERMISSIONS[role].has(permission)) {
    return {
      ok: false as const,
      response: jsonNoStore({ message: "Forbidden" }, 403)
    };
  }

  return {
    ok: true as const,
    role,
    actor: {
      adminId: session.adminId,
      email: session.email
    } satisfies AdminActor
  };
}
