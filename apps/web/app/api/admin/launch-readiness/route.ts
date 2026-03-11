import { NextRequest, NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth/admin-rbac";
import { getLaunchReadinessSnapshot } from "@/lib/admin/launch-readiness";

export async function GET(request: NextRequest) {
  const auth = await requireAdminPermission(request, "launch:read");
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const snapshot = await getLaunchReadinessSnapshot();
    return NextResponse.json(snapshot, {
      status: 200,
      headers: {
        "cache-control": "no-store"
      }
    });
  } catch {
    return NextResponse.json(
      {
        message: "No se pudo construir el snapshot de launch readiness"
      },
      {
        status: 500,
        headers: {
          "cache-control": "no-store"
        }
      }
    );
  }
}
