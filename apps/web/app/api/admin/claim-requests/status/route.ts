import { NextRequest, NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth/admin-rbac";

const API_BASE = process.env.API_URL ?? "http://localhost:4000";

export async function PATCH(request: NextRequest) {
  const auth = await requireAdminPermission(request, "claims:write");
  if (!auth.ok) {
    return auth.response;
  }

  const adminApiKey = process.env.ADMIN_API_KEY?.trim() ?? "";

  try {
    const body = (await request.json()) as {
      claimRequestId?: string;
      status?: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
      verificationMethod?: "PHONE_OTP" | "EMAIL_DOMAIN" | "MANUAL";
      notes?: string;
    };

    if (!body.claimRequestId || !body.status) {
      return NextResponse.json({ message: "claimRequestId y status son requeridos" }, { status: 400 });
    }

    if (body.status === "APPROVED" && !body.verificationMethod) {
      return NextResponse.json({ message: "verificationMethod es requerido para aprobar el claim" }, { status: 400 });
    }

    const response = await fetch(`${API_BASE}/v1/admin/claim-requests/${body.claimRequestId}/status`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "x-admin-key": adminApiKey
      },
      body: JSON.stringify({
        status: body.status,
        verificationMethod: body.verificationMethod,
        notes: body.notes ?? undefined
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
      { message: "No se pudo conectar con el servicio de administración de claims" },
      { status: 503 }
    );
  }
}
