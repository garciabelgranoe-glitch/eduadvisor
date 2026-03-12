import { NextRequest, NextResponse } from "next/server";
import { ensureSchoolOwnership, requireSchoolAdminSession } from "@/lib/auth/api-access";
import { canManageSchoolByProfileStatus } from "@/lib/school-permissions";

const API_BASE = process.env.API_URL?.trim() || "http://localhost:4000";

function absolutizeIfRelative(value: string, origin: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("/")) {
    return new URL(trimmed, origin).toString();
  }

  return trimmed;
}

export async function PATCH(request: NextRequest) {
  const auth = await requireSchoolAdminSession(request);
  if (!auth.ok) {
    return auth.response;
  }

  const adminApiKey = process.env.ADMIN_API_KEY?.trim() ?? "";

  try {
    const body = (await request.json()) as {
      schoolId?: string;
      name?: string;
      description?: string | null;
      website?: string | null;
      phone?: string | null;
      email?: string | null;
      monthlyFeeEstimate?: number | null;
      studentsCount?: number | null;
      latitude?: number;
      longitude?: number;
      levels?: Array<"INICIAL" | "PRIMARIA" | "SECUNDARIA">;
      logoUrl?: string | null;
      galleryUrls?: string[];
    };

    if (!body.schoolId) {
      return NextResponse.json({ message: "schoolId es requerido" }, { status: 400 });
    }

    const ownership = ensureSchoolOwnership(auth.session, body.schoolId);
    if (!ownership.ok) {
      return ownership.response;
    }

    const dashboardResponse = await fetch(`${API_BASE}/v1/schools/id/${body.schoolId}/dashboard`, {
      headers: {
        "x-admin-key": adminApiKey
      },
      cache: "no-store"
    });

    const dashboardPayload = (await dashboardResponse.json().catch(() => null)) as
      | {
          school?: {
            profile?: {
              status?: "BASIC" | "CURATED" | "VERIFIED" | "PREMIUM";
            };
            billing?: {
              entitlements?: {
                canAccessPriorityPlacement?: boolean;
              };
            };
          };
        }
      | null;

    const profileStatus = dashboardPayload?.school?.profile?.status ?? null;
    const canAccessPriorityPlacement = Boolean(dashboardPayload?.school?.billing?.entitlements?.canAccessPriorityPlacement);
    if (!dashboardResponse.ok || !canManageSchoolByProfileStatus(profileStatus)) {
      return NextResponse.json(
        {
          message: "El perfil debe estar verificado para editar datos institucionales."
        },
        { status: 403 }
      );
    }

    const wantsMediaUpdate = body.logoUrl !== undefined || body.galleryUrls !== undefined;
    if (wantsMediaUpdate && !canAccessPriorityPlacement) {
      return NextResponse.json(
        {
          message: "La carga de logo e imágenes está disponible solo para colegios con Premium activo."
        },
        { status: 403 }
      );
    }

    const { schoolId, ...profile } = body;
    const origin = request.nextUrl.origin;
    const normalizedProfile = {
      ...profile,
      logoUrl:
        profile.logoUrl === undefined || profile.logoUrl === null
          ? profile.logoUrl
          : absolutizeIfRelative(profile.logoUrl, origin),
      galleryUrls: Array.isArray(profile.galleryUrls)
        ? profile.galleryUrls.map((item) => absolutizeIfRelative(item, origin))
        : profile.galleryUrls
    };

    const response = await fetch(`${API_BASE}/v1/schools/id/${schoolId}/profile`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "x-admin-key": adminApiKey
      },
      body: JSON.stringify(normalizedProfile),
      cache: "no-store"
    });

    const payload = await response.json().catch(() => ({ message: "Invalid response from API" }));

    if (!response.ok) {
      return NextResponse.json(payload, { status: response.status });
    }

    return NextResponse.json(payload, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "No se pudo conectar con el servicio de colegios" },
      { status: 503 }
    );
  }
}
