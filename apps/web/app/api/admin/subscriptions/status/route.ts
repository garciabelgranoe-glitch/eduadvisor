import { NextRequest, NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth/admin-rbac";

const API_BASE = process.env.API_URL?.trim() || "http://localhost:4000";

export async function PATCH(request: NextRequest) {
  const auth = await requireAdminPermission(request, "subscriptions:write");
  if (!auth.ok) {
    return auth.response;
  }

  const adminApiKey = process.env.ADMIN_API_KEY?.trim() ?? "";

  try {
    const body = (await request.json()) as {
      schoolId?: string;
      status?: "TRIAL" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "EXPIRED";
      planCode?: string;
      priceMonthly?: number;
      durationMonths?: number;
    };

    if (!body.schoolId || !body.status) {
      return NextResponse.json({ message: "schoolId y status son requeridos" }, { status: 400 });
    }

    const response = await fetch(`${API_BASE}/v1/admin/schools/${body.schoolId}/subscription`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "x-admin-key": adminApiKey
      },
      body: JSON.stringify({
        status: body.status,
        planCode: body.planCode,
        priceMonthly: body.priceMonthly,
        durationMonths: body.durationMonths
      }),
      cache: "no-store"
    });

    const payload = await response.json().catch(() => ({ message: "Invalid response from API" }));

    if (!response.ok) {
      return NextResponse.json(payload, { status: response.status });
    }

    return NextResponse.json(payload, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "No se pudo conectar con el servicio de suscripciones" },
      { status: 503 }
    );
  }
}
