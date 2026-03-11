import { NextRequest, NextResponse } from "next/server";
import {
  APP_ROLE_PARENT,
  APP_ROLE_SCHOOL_ADMIN,
  SESSION_COOKIE,
  type AuthSession,
  verifySignedSessionToken
} from "@/lib/auth/session";
import { evaluatePrivateBetaAccess } from "@/lib/beta/private-beta";

function jsonNoStore(payload: Record<string, unknown>, status: number) {
  return NextResponse.json(payload, {
    status,
    headers: {
      "cache-control": "no-store"
    }
  });
}

export async function requireSchoolAdminSession(request: NextRequest) {
  const signed = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySignedSessionToken(signed);

  if (!session) {
    return {
      ok: false as const,
      response: jsonNoStore({ message: "Unauthorized" }, 401)
    };
  }

  if (session.role !== APP_ROLE_SCHOOL_ADMIN) {
    return {
      ok: false as const,
      response: jsonNoStore({ message: "Forbidden" }, 403)
    };
  }

  if (!session.schoolId || !session.schoolSlug) {
    return {
      ok: false as const,
      response: jsonNoStore({ message: "La sesión escolar no tiene alcance válido." }, 403)
    };
  }

  const betaAccess = evaluatePrivateBetaAccess(session);
  if (!betaAccess.allowed) {
    return {
      ok: false as const,
      response: jsonNoStore(
        {
          message: "Acceso disponible solo por invitación durante la beta privada.",
          code: betaAccess.reasonCode
        },
        403
      )
    };
  }

  return {
    ok: true as const,
    session
  };
}

export async function requireParentSession(request: NextRequest) {
  const signed = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySignedSessionToken(signed);

  if (!session) {
    return {
      ok: false as const,
      response: jsonNoStore({ message: "Parent session required" }, 401)
    };
  }

  if (session.role !== APP_ROLE_PARENT) {
    return {
      ok: false as const,
      response: jsonNoStore({ message: "Forbidden" }, 403)
    };
  }

  const betaAccess = evaluatePrivateBetaAccess(session);
  if (!betaAccess.allowed) {
    return {
      ok: false as const,
      response: jsonNoStore(
        {
          message: "Acceso disponible solo por invitación durante la beta privada.",
          code: betaAccess.reasonCode
        },
        403
      )
    };
  }

  return {
    ok: true as const,
    session
  };
}

export function ensureSchoolOwnership(session: AuthSession, schoolId: string) {
  if (session.schoolId !== schoolId) {
    return {
      ok: false as const,
      response: jsonNoStore({ message: "No tienes permisos para operar sobre este colegio." }, 403)
    };
  }

  return {
    ok: true as const
  };
}
