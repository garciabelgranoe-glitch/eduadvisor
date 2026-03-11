import { NextRequest, NextResponse } from "next/server";
import { ensureSchoolOwnership, requireSchoolAdminSession } from "@/lib/auth/api-access";

const API_BASE = process.env.API_URL ?? "http://localhost:4000";

export async function PATCH(request: NextRequest) {
  const auth = await requireSchoolAdminSession(request);
  if (!auth.ok) {
    return auth.response;
  }

  const adminApiKey = process.env.ADMIN_API_KEY?.trim() ?? "";

  try {
    const body = (await request.json()) as {
      reviewId?: string;
      schoolId?: string;
      response?: string;
    };

    if (!body.reviewId || !body.schoolId || typeof body.response !== "string") {
      return NextResponse.json(
        { message: "reviewId, schoolId y response son requeridos" },
        { status: 400 }
      );
    }

    const ownership = ensureSchoolOwnership(auth.session, body.schoolId);
    if (!ownership.ok) {
      return ownership.response;
    }

    const apiResponse = await fetch(`${API_BASE}/v1/reviews/${body.reviewId}/response`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "x-admin-key": adminApiKey
      },
      body: JSON.stringify({
        schoolId: body.schoolId,
        response: body.response
      }),
      cache: "no-store"
    });

    const payload = await apiResponse.json().catch(() => ({ message: "Invalid response from API" }));

    if (!apiResponse.ok) {
      return NextResponse.json(payload, { status: apiResponse.status });
    }

    return NextResponse.json(payload, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "No se pudo conectar con el servicio de reviews" },
      { status: 503 }
    );
  }
}
