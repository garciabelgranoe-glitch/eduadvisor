import { NextRequest, NextResponse } from "next/server";
import { ensureSchoolOwnership, requireSchoolAdminSession } from "@/lib/auth/api-access";

const API_BASE = process.env.API_URL ?? "http://localhost:4000";

function sanitizeSchoolId(value: string | null) {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  if (normalized.length < 10 || normalized.length > 64) {
    return null;
  }

  return normalized;
}

export async function GET(request: NextRequest) {
  const auth = await requireSchoolAdminSession(request);
  if (!auth.ok) {
    return auth.response;
  }

  const adminApiKey = process.env.ADMIN_API_KEY?.trim() ?? "";
  const schoolId = sanitizeSchoolId(request.nextUrl.searchParams.get("schoolId"));

  if (!schoolId) {
    return NextResponse.json({ message: "schoolId inválido" }, { status: 400 });
  }

  const ownership = ensureSchoolOwnership(auth.session, schoolId);
  if (!ownership.ok) {
    return ownership.response;
  }

  try {
    const response = await fetch(`${API_BASE}/v1/schools/id/${encodeURIComponent(schoolId)}/leads/export`, {
      headers: {
        "x-admin-key": adminApiKey
      },
      cache: "no-store"
    });

    const payload = (await response.json().catch(() => null)) as
      | {
          message?: string;
          fileName?: string;
          csv?: string;
          contentType?: string;
        }
      | null;

    if (!response.ok) {
      return NextResponse.json(
        {
          message: payload?.message ?? "No se pudo exportar leads."
        },
        { status: response.status }
      );
    }

    const fileName = payload?.fileName ?? "leads.csv";
    const csv = payload?.csv ?? "";

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "content-type": payload?.contentType ?? "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename=\"${fileName}\"`
      }
    });
  } catch {
    return NextResponse.json({ message: "No se pudo conectar con backend de colegios." }, { status: 503 });
  }
}
