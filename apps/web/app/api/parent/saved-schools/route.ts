import { NextRequest, NextResponse } from "next/server";
import { requireParentSession } from "@/lib/auth/api-access";

const API_BASE = process.env.API_URL?.trim() || "http://localhost:4000";

function sanitizeSchoolId(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  if (normalized.length < 10 || normalized.length > 64) {
    return null;
  }

  return normalized;
}

export async function GET(request: NextRequest) {
  const auth = await requireParentSession(request);
  if (!auth.ok) {
    return auth.response;
  }
  const { session } = auth;

  const adminApiKey = process.env.ADMIN_API_KEY?.trim() ?? "";
  try {
    const response = await fetch(`${API_BASE}/v1/parents/${encodeURIComponent(session.userId)}/saved-schools`, {
      headers: {
        "x-admin-key": adminApiKey
      },
      cache: "no-store"
    });

    const data = await response.json().catch(() => null);
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ message: "No se pudo consultar favoritos." }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireParentSession(request);
  if (!auth.ok) {
    return auth.response;
  }
  const { session } = auth;

  const body = await request.json().catch(() => null);
  const schoolId = sanitizeSchoolId(body?.schoolId);
  if (!schoolId) {
    return NextResponse.json({ message: "schoolId inválido" }, { status: 400 });
  }

  const adminApiKey = process.env.ADMIN_API_KEY?.trim() ?? "";
  try {
    const response = await fetch(`${API_BASE}/v1/parents/${encodeURIComponent(session.userId)}/saved-schools`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-admin-key": adminApiKey
      },
      body: JSON.stringify({ schoolId }),
      cache: "no-store"
    });

    const data = await response.json().catch(() => null);
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ message: "No se pudo guardar colegio." }, { status: 502 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireParentSession(request);
  if (!auth.ok) {
    return auth.response;
  }
  const { session } = auth;

  const schoolId = sanitizeSchoolId(request.nextUrl.searchParams.get("schoolId"));
  if (!schoolId) {
    return NextResponse.json({ message: "schoolId inválido" }, { status: 400 });
  }

  const adminApiKey = process.env.ADMIN_API_KEY?.trim() ?? "";
  try {
    const response = await fetch(
      `${API_BASE}/v1/parents/${encodeURIComponent(session.userId)}/saved-schools/${encodeURIComponent(schoolId)}`,
      {
        method: "DELETE",
        headers: {
          "x-admin-key": adminApiKey
        },
        cache: "no-store"
      }
    );

    const data = await response.json().catch(() => null);
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ message: "No se pudo remover colegio." }, { status: 502 });
  }
}
