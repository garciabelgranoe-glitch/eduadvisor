import { NextRequest, NextResponse } from "next/server";
import { ensureSchoolOwnership, requireSchoolAdminSession } from "@/lib/auth/api-access";

const API_BASE = process.env.API_URL?.trim() || "http://localhost:4000";

function resolveReturnTo(rawValue: string | null, schoolSlug: string | null) {
  if (rawValue && rawValue.startsWith("/") && !rawValue.startsWith("//")) {
    return rawValue;
  }

  if (schoolSlug) {
    return `/school-dashboard?school=${encodeURIComponent(schoolSlug)}`;
  }

  return "/school-dashboard";
}

export async function GET(request: NextRequest) {
  const auth = await requireSchoolAdminSession(request);
  if (!auth.ok) {
    const signIn = request.nextUrl.clone();
    signIn.pathname = "/ingresar";
    signIn.search = "";
    signIn.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(signIn, { status: 303 });
  }

  const adminApiKey = process.env.ADMIN_API_KEY?.trim() ?? "";
  const schoolId = request.nextUrl.searchParams.get("schoolId")?.trim();
  const schoolSlug = request.nextUrl.searchParams.get("school")?.trim() ?? null;
  const returnTo = resolveReturnTo(request.nextUrl.searchParams.get("returnTo"), schoolSlug);

  if (!schoolId) {
    const fallback = request.nextUrl.clone();
    fallback.pathname = returnTo;
    fallback.searchParams.set("billing", "missing_school");
    return NextResponse.redirect(fallback, { status: 303 });
  }

  const ownership = ensureSchoolOwnership(auth.session, schoolId);
  if (!ownership.ok) {
    const fallback = request.nextUrl.clone();
    fallback.pathname = returnTo;
    fallback.searchParams.set("billing", "forbidden");
    return NextResponse.redirect(fallback, { status: 303 });
  }

  try {
    const response = await fetch(`${API_BASE}/v1/admin/billing/checkout-sessions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-admin-key": adminApiKey
      },
      body: JSON.stringify({
        schoolId,
        provider: "MANUAL",
        planCode: "premium",
        amountMonthly: 99000,
        currency: "ARS",
        intervalMonths: 1
      }),
      cache: "no-store"
    });

    const payload = (await response.json().catch(() => null)) as { checkoutUrl?: string } | null;
    if (!response.ok || !payload?.checkoutUrl) {
      const fallback = request.nextUrl.clone();
      fallback.pathname = returnTo;
      fallback.searchParams.set("billing", "checkout_error");
      return NextResponse.redirect(fallback, { status: 303 });
    }

    return NextResponse.redirect(payload.checkoutUrl, { status: 303 });
  } catch {
    const fallback = request.nextUrl.clone();
    fallback.pathname = returnTo;
    fallback.searchParams.set("billing", "connection_error");
    return NextResponse.redirect(fallback, { status: 303 });
  }
}
