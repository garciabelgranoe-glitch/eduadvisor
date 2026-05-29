import { NextRequest, NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth/admin-rbac";

const API_BASE = process.env.API_URL?.trim() || "http://localhost:4000";

function absolutizeIfRelative(value: string, origin: string) {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) return new URL(trimmed, origin).toString();
  return trimmed;
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdminPermission(request, "schools:write");
  if (!auth.ok) return auth.response;

  const adminApiKey = process.env.ADMIN_API_KEY?.trim() ?? "";

  try {
    const body = (await request.json()) as {
      schoolId?: string;
      name?: string;
      description?: string | null;
      website?: string | null;
      phone?: string | null;
      email?: string | null;
      monthlyFeeEstimate?: number | null;
      studentsCount?: number | null;
      levels?: Array<"INICIAL" | "PRIMARIA" | "SECUNDARIA">;
      logoUrl?: string | null;
      galleryUrls?: string[];
    };

    if (!body.schoolId) {
      return NextResponse.json({ message: "schoolId es requerido" }, { status: 400 });
    }

    const { schoolId, ...profile } = body;
    const origin = request.nextUrl.origin;
    const normalizedProfile = {
      ...profile,
      logoUrl: profile.logoUrl === undefined || profile.logoUrl === null
        ? profile.logoUrl
        : absolutizeIfRelative(profile.logoUrl, origin),
      galleryUrls: Array.isArray(profile.galleryUrls)
        ? profile.galleryUrls.map((item) => absolutizeIfRelative(item, origin))
        : profile.galleryUrls
    };

    const res = await fetch(`${API_BASE}/v1/schools/id/${schoolId}/profile`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "x-admin-key": adminApiKey
      },
      body: JSON.stringify(normalizedProfile)
    });

    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ message: "No se pudo conectar con el backend." }, { status: 502 });
  }
}
