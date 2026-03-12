import { NextRequest, NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth/admin-rbac";

const API_BASE = process.env.API_URL?.trim() || "http://localhost:4000";

export async function POST(request: NextRequest) {
  const auth = await requireAdminPermission(request, "billing:simulate");
  if (!auth.ok) {
    return auth.response;
  }

  const adminApiKey = process.env.ADMIN_API_KEY?.trim() ?? "";

  try {
    const body = (await request.json()) as {
      schoolId?: string;
      eventType?: "checkout.session.completed" | "invoice.paid" | "invoice.payment_failed" | "subscription.canceled" | "subscription.renewed";
      checkoutSessionId?: string;
      amountMonthly?: number;
      amountTotal?: number;
      durationMonths?: number;
      trialDays?: number;
    };

    if (!body.schoolId || !body.eventType) {
      return NextResponse.json({ message: "schoolId y eventType son requeridos" }, { status: 400 });
    }

    const response = await fetch(`${API_BASE}/v1/admin/billing/events/simulate`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-admin-key": adminApiKey
      },
      body: JSON.stringify({
        provider: "MANUAL",
        schoolId: body.schoolId,
        eventType: body.eventType,
        checkoutSessionId: body.checkoutSessionId,
        amountMonthly: body.amountMonthly,
        amountTotal: body.amountTotal,
        durationMonths: body.durationMonths,
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
    return NextResponse.json({ message: "No se pudo conectar con el simulador de billing" }, { status: 503 });
  }
}
