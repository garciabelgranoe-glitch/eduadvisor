import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckoutSimulationActions } from "@/components/billing/checkout-simulation-actions";
import { Card } from "@/components/ui/card";
import { getAdminBillingCheckoutSession } from "@/lib/api";
import { APP_ROLE_SCHOOL_ADMIN } from "@/lib/auth/session";
import { getServerAuthSession } from "@/lib/auth/server-session";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Checkout",
  description: "Checkout de suscripción para colegios.",
  canonicalPath: "/checkout"
});

interface CheckoutPageProps {
  params: {
    sessionId: string;
  };
}

export const dynamic = "force-dynamic";

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const session = await getServerAuthSession();
  if (!session || session.role !== APP_ROLE_SCHOOL_ADMIN || !session.schoolId) {
    redirect(`/ingresar?next=${encodeURIComponent(`/checkout/${params.sessionId}`)}`);
  }

  const checkout = await getAdminBillingCheckoutSession(params.sessionId);

  if (!checkout) {
    return (
      <div className="mx-auto max-w-3xl py-8">
        <Card className="space-y-2">
          <h1 className="font-display text-3xl text-ink">Checkout no disponible</h1>
          <p className="text-sm text-slate-600">
            No se encontró la sesión solicitada. Genera un nuevo checkout desde panel admin o dashboard de colegio.
          </p>
        </Card>
      </div>
    );
  }

  if (checkout.school.id !== session.schoolId) {
    const dashboardPath = session.schoolSlug
      ? `/school-dashboard?school=${encodeURIComponent(session.schoolSlug)}`
      : "/school-dashboard";
    return (
      <div className="mx-auto max-w-3xl py-8">
        <Card className="space-y-2">
          <h1 className="font-display text-3xl text-ink">Acceso restringido</h1>
          <p className="text-sm text-slate-600">
            Esta sesión de checkout no pertenece al colegio autenticado.
          </p>
          <Link
            href={dashboardPath as never}
            className="text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            Volver al panel del colegio
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl py-8">
      <Card className="space-y-4">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-700">Checkout (modo demo)</p>
        <h1 className="font-display text-3xl text-ink">Suscripción {checkout.planCode.toUpperCase()}</h1>
        <p className="text-sm text-slate-600">
          Colegio: <span className="font-semibold text-ink">{checkout.school.name}</span> · /{checkout.school.slug}
        </p>

        <div className="grid gap-3 md:grid-cols-3">
          <Card>
            <p className="text-xs text-slate-500">Estado</p>
            <p className="text-lg font-semibold text-ink">{checkout.status}</p>
          </Card>
          <Card>
            <p className="text-xs text-slate-500">Monto mensual</p>
            <p className="text-lg font-semibold text-ink">
              {checkout.currency} {checkout.amountMonthly.toLocaleString("es-AR")}
            </p>
          </Card>
          <Card>
            <p className="text-xs text-slate-500">Intervalo</p>
            <p className="text-lg font-semibold text-ink">{checkout.intervalMonths} mes(es)</p>
          </Card>
        </div>

        {checkout.status === "OPEN" ? (
          <>
            <p className="text-sm text-slate-700">
              Mientras definimos pasarela final (Stripe/Mercado Pago), puedes simular eventos de cobro para validar
              lifecycle de suscripción.
            </p>
            <CheckoutSimulationActions schoolId={checkout.school.id} sessionId={checkout.id} />
          </>
        ) : (
          <p className="text-sm text-slate-700">
            Esta sesión ya no está abierta para nuevas operaciones. Crea un checkout nuevo si necesitas probar otro flujo.
          </p>
        )}

        <div className="pt-1 text-sm">
          <Link href={`/school-dashboard?school=${encodeURIComponent(checkout.school.slug)}`} className="text-brand-700 hover:text-brand-800">
            Volver al dashboard del colegio
          </Link>
        </div>
      </Card>
    </div>
  );
}
