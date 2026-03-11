import { NextRequest, NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth/admin-rbac";

const API_BASE = process.env.API_URL ?? "http://localhost:4000";

export async function PATCH(request: NextRequest) {
  const auth = await requireAdminPermission(request, "schools:write");
  if (!auth.ok) {
    return auth.response;
  }

  const adminApiKey = process.env.ADMIN_API_KEY?.trim() ?? "";

  try {
    const body = (await request.json()) as {
      schoolId?: string;
      active?: boolean;
    };

    if (!body.schoolId || typeof body.active !== "boolean") {
      return NextResponse.json({ message: "schoolId y active son requeridos" }, { status: 400 });
    }

    const response = await fetch(`${API_BASE}/v1/admin/schools/${body.schoolId}/status`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "x-admin-key": adminApiKey
      },
      body: JSON.stringify({ active: body.active }),
      cache: "no-store"
    });

    const payload = await response.json().catch(() => ({ message: "Invalid response from API" }));

    if (!response.ok) {
      return NextResponse.json(payload, { status: response.status });
    }

    return NextResponse.json(payload, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "No se pudo conectar con el servicio de administración" },
      { status: 503 }
    );
  }
}
