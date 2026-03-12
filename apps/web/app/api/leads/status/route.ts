import { NextRequest, NextResponse } from "next/server";
import { ensureSchoolOwnership, requireSchoolAdminSession } from "@/lib/auth/api-access";
import { canManageSchoolByProfileStatus } from "@/lib/school-permissions";

const API_BASE = process.env.API_URL?.trim() || "http://localhost:4000";

export async function PATCH(request: NextRequest) {
  const auth = await requireSchoolAdminSession(request);
  if (!auth.ok) {
    return auth.response;
  }

  const adminApiKey = process.env.ADMIN_API_KEY?.trim() ?? "";

  try {
    const body = (await request.json()) as {
      leadId?: string;
      status?: "NEW" | "CONTACTED" | "QUALIFIED" | "CLOSED";
      schoolId?: string;
    };

    if (!body.leadId || !body.status || !body.schoolId) {
      return NextResponse.json({ message: "leadId, status y schoolId son requeridos" }, { status: 400 });
    }

    const ownership = ensureSchoolOwnership(auth.session, body.schoolId);
    if (!ownership.ok) {
      return ownership.response;
    }

    const leadResponse = await fetch(`${API_BASE}/v1/leads/${body.leadId}`, {
      headers: {
        "x-admin-key": adminApiKey
      },
      cache: "no-store"
    });

    const leadPayload = (await leadResponse.json().catch(() => null)) as
      | {
          schoolId?: string;
          school?: { profileStatus?: "BASIC" | "CURATED" | "VERIFIED" | "PREMIUM" };
        }
      | null;

    const leadSchoolId = leadPayload?.schoolId;
    const profileStatus = leadPayload?.school?.profileStatus ?? null;

    if (!leadResponse.ok || !leadSchoolId || leadSchoolId !== body.schoolId) {
      return NextResponse.json(
        {
          message: "No se pudo validar el colegio asociado al lead."
        },
        { status: 403 }
      );
    }

    if (!canManageSchoolByProfileStatus(profileStatus)) {
      return NextResponse.json(
        {
          message: "El perfil debe estar verificado para gestionar estados de leads."
        },
        { status: 403 }
      );
    }

    const response = await fetch(`${API_BASE}/v1/leads/${body.leadId}/status`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "x-admin-key": adminApiKey
      },
      body: JSON.stringify({ status: body.status }),
      cache: "no-store"
    });

    const payload = await response.json().catch(() => ({ message: "Invalid response from API" }));

    if (!response.ok) {
      return NextResponse.json(payload, { status: response.status });
    }

    return NextResponse.json(payload, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "No se pudo conectar con el servicio de leads" },
      { status: 503 }
    );
  }
}
