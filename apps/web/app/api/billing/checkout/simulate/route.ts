import { NextRequest, NextResponse } from "next/server";
import { ensureSchoolOwnership, requireSchoolAdminSession } from "@/lib/auth/api-access";

const API_BASE = process.env.API_URL ?? "http://localhost:4000";

type CheckoutAction = "success" | "failed" | "canceled";

function isCheckoutAction(value: string): value is CheckoutAction {
  return value === "success" || value === "failed" || value === "canceled";
}

export async function POST(request: NextRequest) {
  const auth = await requireSchoolAdminSession(request);
  if (!auth.ok) {
    return auth.response;
  }

  const adminApiKey = process.env.ADMIN_API_KEY?.trim() ?? "";

  try {
    const body = (await request.json()) as {
      schoolId?: string;
      sessionId?: string;
      action?: string;
    };

    if (!body.schoolId || !body.sessionId || !body.action || !isCheckoutAction(body.action)) {
      return NextResponse.json({ message: "schoolId, sessionId y action son requeridos" }, { status: 400 });
    }

    const ownership = ensureSchoolOwnership(auth.session, body.schoolId);
    if (!ownership.ok) {
      return ownership.response;
    }

    const checkoutSessionResponse = await fetch(
      `${API_BASE}/v1/admin/billing/checkout-sessions/${encodeURIComponent(body.sessionId)}`,
      {
        headers: {
          "x-admin-key": adminApiKey
        },
        cache: "no-store"
      }
    );
    const checkoutSessionPayload = (await checkoutSessionResponse.json().catch(() => null)) as
      | {
          school?: {
            id?: string;
          };
        }
      | null;

    if (!checkoutSessionResponse.ok || checkoutSessionPayload?.school?.id !== body.schoolId) {
      return NextResponse.json(
        {
          message: "La sesión de checkout no pertenece al colegio autenticado."
        },
        { status: 403 }
      );
    }

    const simulate = async (
      eventType: "checkout.session.completed" | "invoice.paid" | "invoice.payment_failed" | "subscription.canceled"
    ) => {
      const response = await fetch(`${API_BASE}/v1/admin/billing/events/simulate`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-key": adminApiKey
        },
        body: JSON.stringify({
          provider: "MANUAL",
          schoolId: body.schoolId,
          checkoutSessionId: body.sessionId,
          eventType
        }),
        cache: "no-store"
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ message: "Billing simulation failed" }));
        throw new Error(payload?.message ?? "Billing simulation failed");
      }
    };

    if (body.action === "success") {
      await simulate("checkout.session.completed");
      await simulate("invoice.paid");
      return NextResponse.json({ ok: true, message: "Pago simulado con éxito." }, { status: 200 });
    }

    if (body.action === "failed") {
      await simulate("invoice.payment_failed");
      return NextResponse.json({ ok: true, message: "Pago fallido simulado." }, { status: 200 });
    }

    await simulate("subscription.canceled");
    return NextResponse.json({ ok: true, message: "Cancelación simulada." }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo ejecutar simulación de checkout";
    return NextResponse.json({ message }, { status: 503 });
  }
}
