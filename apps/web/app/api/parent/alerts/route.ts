import { NextRequest, NextResponse } from "next/server";
import { requireParentSession } from "@/lib/auth/api-access";

const API_BASE = process.env.API_URL?.trim() || "http://localhost:4000";

function sanitizeAlertId(value: unknown) {
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
    const response = await fetch(`${API_BASE}/v1/parents/${encodeURIComponent(session.userId)}/alerts`, {
      headers: {
        "x-admin-key": adminApiKey
      },
      cache: "no-store"
    });

    const data = await response.json().catch(() => null);
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ message: "No se pudieron consultar alertas." }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireParentSession(request);
  if (!auth.ok) {
    return auth.response;
  }
  const { session } = auth;

  const body = await request.json().catch(() => null);
  const alertId = sanitizeAlertId(body?.alertId);
  if (!alertId) {
    return NextResponse.json({ message: "alertId inválido" }, { status: 400 });
  }

  const adminApiKey = process.env.ADMIN_API_KEY?.trim() ?? "";
  try {
    const response = await fetch(
      `${API_BASE}/v1/parents/${encodeURIComponent(session.userId)}/alerts/${encodeURIComponent(alertId)}/read`,
      {
        method: "POST",
        headers: {
          "x-admin-key": adminApiKey
        },
        cache: "no-store"
      }
    );

    const data = await response.json().catch(() => null);
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ message: "No se pudo actualizar alerta." }, { status: 502 });
  }
}
