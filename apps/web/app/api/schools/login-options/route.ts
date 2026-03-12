import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.API_URL?.trim() || "http://localhost:4000";

function sanitizeQuery(value: string | null) {
  if (!value) {
    return "";
  }

  return value.trim().slice(0, 80);
}

export async function GET(request: NextRequest) {
  const q = sanitizeQuery(request.nextUrl.searchParams.get("q"));
  const adminApiKey = process.env.ADMIN_API_KEY?.trim() ?? "";

  const params = new URLSearchParams({
    status: "active",
    page: "1",
    limit: "100",
    sortBy: "name",
    sortOrder: "asc"
  });

  if (q.length > 0) {
    params.set("q", q);
  }

  try {
    const response = await fetch(`${API_BASE}/v1/admin/schools?${params.toString()}`, {
      headers: {
        "x-admin-key": adminApiKey
      },
      cache: "no-store"
    });

    if (!response.ok) {
      return NextResponse.json({ items: [] }, { status: 200 });
    }

    const payload = (await response.json().catch(() => null)) as
      | {
          items?: Array<{
            id: string;
            slug: string;
            name: string;
            city: string;
            province: string;
          }>;
        }
      | null;

    const items = (payload?.items ?? []).map((school) => ({
      id: school.id,
      slug: school.slug,
      name: school.name,
      city: school.city,
      province: school.province
    }));

    return NextResponse.json({ items }, { status: 200 });
  } catch {
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
