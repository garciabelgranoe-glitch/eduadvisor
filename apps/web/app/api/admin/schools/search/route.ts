import { NextRequest, NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth/admin-rbac";

const API_BASE = process.env.API_URL?.trim() || "http://localhost:4000";
const MAX_LIMIT = 20;

function normalizeStatus(value: string | null): "all" | "active" | "inactive" {
  if (value === "active" || value === "inactive" || value === "all") {
    return value;
  }

  return "all";
}

function normalizeLimit(value: string | null) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return MAX_LIMIT;
  }

  return Math.min(MAX_LIMIT, Math.floor(parsed));
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminPermission(request, "schools:write");
  if (!auth.ok) {
    return auth.response;
  }

  const adminApiKey = process.env.ADMIN_API_KEY?.trim() ?? "";
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const status = normalizeStatus(request.nextUrl.searchParams.get("status"));
  const limit = normalizeLimit(request.nextUrl.searchParams.get("limit"));

  const params = new URLSearchParams();
  params.set("page", "1");
  params.set("limit", String(limit));
  params.set("status", status);
  params.set("sortBy", "name");
  params.set("sortOrder", "asc");
  if (query.length > 0) {
    params.set("q", query);
  }

  try {
    const response = await fetch(`${API_BASE}/v1/admin/schools?${params.toString()}`, {
      headers: {
        "x-admin-key": adminApiKey
      },
      cache: "no-store"
    });

    const payload = (await response.json().catch(() => null)) as
      | {
          items?: Array<{
            id: string;
            name: string;
            slug: string;
            city?: string;
            province?: string;
            active?: boolean;
          }>;
          meta?: unknown;
          message?: string;
        }
      | null;

    if (!response.ok) {
      return NextResponse.json({ message: payload?.message ?? "No se pudo buscar colegios." }, { status: response.status });
    }

    return NextResponse.json(
      {
        items: (payload?.items ?? []).map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          city: item.city ?? null,
          province: item.province ?? null,
          active: item.active ?? true
        }))
      },
      {
        status: 200,
        headers: {
          "cache-control": "no-store"
        }
      }
    );
  } catch {
    return NextResponse.json({ message: "No se pudo conectar con el servicio de administración" }, { status: 503 });
  }
}
