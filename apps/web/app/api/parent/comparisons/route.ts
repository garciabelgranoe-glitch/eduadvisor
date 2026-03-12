import { NextRequest, NextResponse } from "next/server";
import { requireParentSession } from "@/lib/auth/api-access";

const API_BASE = process.env.API_URL?.trim() || "http://localhost:4000";

function sanitizeComparisonId(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  if (normalized.length < 10 || normalized.length > 64) {
    return null;
  }

  return normalized;
}

function sanitizeSlugs(input: unknown) {
  if (!Array.isArray(input)) {
    return null;
  }

  const normalized = input
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 3);

  if (normalized.length < 2) {
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
    const response = await fetch(`${API_BASE}/v1/parents/${encodeURIComponent(session.userId)}/comparisons`, {
      headers: {
        "x-admin-key": adminApiKey
      },
      cache: "no-store"
    });

    const data = await response.json().catch(() => null);
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ message: "No se pudieron consultar comparaciones." }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireParentSession(request);
  if (!auth.ok) {
    return auth.response;
  }
  const { session } = auth;

  const body = await request.json().catch(() => null);
  const schoolSlugs = sanitizeSlugs(body?.schoolSlugs);
  if (!schoolSlugs) {
    return NextResponse.json({ message: "schoolSlugs inválido" }, { status: 400 });
  }

  const adminApiKey = process.env.ADMIN_API_KEY?.trim() ?? "";
  try {
    const response = await fetch(`${API_BASE}/v1/parents/${encodeURIComponent(session.userId)}/comparisons`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-admin-key": adminApiKey
      },
      body: JSON.stringify({ schoolSlugs }),
      cache: "no-store"
    });

    const data = await response.json().catch(() => null);
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ message: "No se pudo guardar comparación." }, { status: 502 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireParentSession(request);
  if (!auth.ok) {
    return auth.response;
  }
  const { session } = auth;

  const comparisonId = sanitizeComparisonId(request.nextUrl.searchParams.get("comparisonId"));
  if (!comparisonId) {
    return NextResponse.json({ message: "comparisonId inválido" }, { status: 400 });
  }

  const adminApiKey = process.env.ADMIN_API_KEY?.trim() ?? "";
  try {
    const response = await fetch(
      `${API_BASE}/v1/parents/${encodeURIComponent(session.userId)}/comparisons/${encodeURIComponent(comparisonId)}`,
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
    return NextResponse.json({ message: "No se pudo eliminar comparación." }, { status: 502 });
  }
}
