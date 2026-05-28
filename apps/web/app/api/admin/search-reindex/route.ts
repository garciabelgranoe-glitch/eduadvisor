import { NextRequest, NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth/admin-rbac";

const API_BASE = process.env.API_URL?.trim() || "http://localhost:4000";

export async function POST(request: NextRequest) {
  const auth = await requireAdminPermission(request, "search:reindex");
  if (!auth.ok) {
    return auth.response;
  }

  const adminApiKey = process.env.ADMIN_WRITE_API_KEY?.trim() ?? process.env.ADMIN_API_KEY?.trim() ?? "";

  try {
    const res = await fetch(`${API_BASE}/v1/search/reindex`, {
      method: "POST",
      headers: {
        "x-admin-key": adminApiKey,
        "x-admin-scope": "write"
      }
    });

    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ message: "No se pudo conectar con el backend." }, { status: 502 });
  }
}
