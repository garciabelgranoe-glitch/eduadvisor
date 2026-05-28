import { NextRequest, NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth/admin-rbac";

const API_BASE = process.env.API_URL?.trim() || "http://localhost:4000";

export async function POST(request: NextRequest) {
  const auth = await requireAdminPermission(request, "import:write");
  if (!auth.ok) {
    return auth.response;
  }

  const adminApiKey = process.env.ADMIN_WRITE_API_KEY?.trim() ?? process.env.ADMIN_API_KEY?.trim() ?? "";

  try {
    const body = await request.json();
    const res = await fetch(`${API_BASE}/v1/admin/import-runs`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-admin-key": adminApiKey,
        "x-admin-scope": "write"
      },
      body: JSON.stringify(body)
    });

    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ message: "No se pudo conectar con el backend." }, { status: 502 });
  }
}
