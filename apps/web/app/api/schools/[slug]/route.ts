import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.API_URL?.trim() || "http://localhost:4000";

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const res = await fetch(`${API_BASE}/v1/schools/${params.slug}`, {
      cache: "no-store"
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ message: "No se pudo conectar con el backend." }, { status: 502 });
  }
}
