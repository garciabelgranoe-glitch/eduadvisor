import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth/admin-rbac";
import { normalizeSlug, canonicalizeSlug } from "@/lib/seo/routes";

const API_BASE = process.env.API_URL?.trim() || "http://localhost:4000";

export async function PATCH(request: NextRequest) {
  const auth = await requireAdminPermission(request, "reviews:moderate");
  if (!auth.ok) {
    return auth.response;
  }

  const adminApiKey = process.env.ADMIN_API_KEY?.trim() ?? "";

  try {
    const body = (await request.json()) as {
      reviewId?: string;
      status?: "APPROVED" | "REJECTED";
      schoolSlug?: string;
    };

    if (!body.reviewId || !body.status) {
      return NextResponse.json({ message: "reviewId y status son requeridos" }, { status: 400 });
    }

    const response = await fetch(`${API_BASE}/v1/reviews/${body.reviewId}/moderate`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "x-admin-key": adminApiKey
      },
      body: JSON.stringify({ status: body.status }),
      cache: "no-store"
    });

    const payload = await response.json().catch(() => ({ message: "Invalid response from API" }));

    if (!response.ok) {
      return NextResponse.json(payload, { status: response.status });
    }

    // Invalidate the school page cache so the approved review appears immediately
    if (body.schoolSlug) {
      try {
        const schoolRes = await fetch(`${API_BASE}/v1/schools/${body.schoolSlug}`, {
          headers: { "x-admin-key": adminApiKey },
          cache: "no-store"
        });
        if (schoolRes.ok) {
          const school = (await schoolRes.json()) as {
            location?: { province?: string; city?: string };
          };
          const province = school.location?.province;
          const city = school.location?.city;
          if (province && city) {
            const provinceSlug = canonicalizeSlug(normalizeSlug(province));
            const citySlug = canonicalizeSlug(normalizeSlug(city));
            revalidatePath(`/ar/${provinceSlug}/${citySlug}/colegios/${body.schoolSlug}`);
          }
        }
      } catch {
        // Revalidation failure is non-fatal — the page will refresh naturally via ISR
      }
    }

    return NextResponse.json(payload, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "No se pudo conectar con el servicio de moderación" },
      { status: 503 }
    );
  }
}
