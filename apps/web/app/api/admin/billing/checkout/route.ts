import { NextRequest, NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth/admin-rbac";

const API_BASE = process.env.API_URL ?? "http://localhost:4000";

export async function POST(request: NextRequest) {
  const auth = await requireAdminPermission(request, "billing:checkout");
  if (!auth.ok) {
    return auth.response;
  }

  const adminApiKey = process.env.ADMIN_API_KEY?.trim() ?? "";

  try {
    const body = (await request.json()) as {
      schoolId?: string;
      provider?: "MANUAL" | "STRIPE" | "MERCADO_PAGO";
      planCode?: string;
      amountMonthly?: number;
      currency?: string;
      intervalMonths?: number;
      trialDays?: number;
    };

    if (!body.schoolId) {
      return NextResponse.json({ message: "schoolId es requerido" }, { status: 400 });
    }

    const response = await fetch(`${API_BASE}/v1/admin/billing/checkout-sessions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-admin-key": adminApiKey
      },
      body: JSON.stringify({
        schoolId: body.schoolId,
        provider: body.provider,
        planCode: body.planCode,
        amountMonthly: body.amountMonthly,
        currency: body.currency,
        intervalMonths: body.intervalMonths,
        trialDays: body.trialDays
      }),
      cache: "no-store"
    });

    const payload = await response.json().catch(() => ({ message: "Invalid response from billing API" }));
    if (!response.ok) {
      return NextResponse.json(payload, { status: response.status });
    }

    return NextResponse.json(payload, { status: 200 });
  } catch {
    return NextResponse.json({ message: "No se pudo conectar con el servicio de checkout" }, { status: 503 });
  }
}
