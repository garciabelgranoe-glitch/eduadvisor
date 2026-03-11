import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { ParentAlertsPanel } from "@/components/parent/parent-alerts-panel";
import { Card } from "@/components/ui/card";
import { DataEvidence } from "@/components/ui/data-evidence";
import { MetricTile } from "@/components/ui/metric-tile";
import { getParentDashboard } from "@/lib/api";
import { APP_ROLE_PARENT } from "@/lib/auth/session";
import { getServerAuthSession } from "@/lib/auth/server-session";
import { formatCurrency, formatRating } from "@/lib/format";
import { buildNoIndexMetadata, citySchoolProfilePath } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Panel de familias",
  description: "Panel de seguimiento para familias con búsquedas, alertas y comparaciones.",
  canonicalPath: "/parent-dashboard"
});

export default async function ParentDashboardPage() {
  const session = await getServerAuthSession();
  if (!session || session.role !== APP_ROLE_PARENT) {
    redirect("/ingresar?next=/parent-dashboard");
  }

  const dashboard = await getParentDashboard(session.userId);
  const savedSchools = dashboard?.savedSchools ?? [];
  const savedComparisons = dashboard?.comparisons ?? [];
  const alerts = dashboard?.alerts ?? [];
  const unreadAlerts = alerts.filter((item) => !item.isRead).length;
  const metrics = dashboard?.metrics ?? {
    savedSchools: savedSchools.length,
    activeComparisons: savedComparisons.length,
    unreadAlerts,
    nextOpenHouse: null
  };
  const nextAction = dashboard?.nextAction ?? {
    stage: "DISCOVERY",
    title: "Empezá por tu shortlist",
    detail: "Guardá colegios para activar recomendaciones y comparaciones personalizadas.",
    ctaLabel: "Explorar colegios",
    ctaPath: "/search"
  };

  const activity =
    savedSchools.length > 0
      ? savedSchools.slice(0, 4).map((item, index) => ({
          title:
            index === 0
              ? `Guardaste ${item.school.name}`
              : index === 1
                ? `Comparación sugerida: ${item.school.name}`
                : `Seguimiento de perfil: ${item.school.name}`,
          detail:
            index === 0
              ? `Podés revisar su perfil completo en ${item.school.city}, ${item.school.province}.`
              : index === 1
                ? "Agregalo al comparador para evaluar cuota, nivel y ratings en una sola vista."
                : "Mantén este perfil en favoritos para monitorear cambios y nuevas reseñas.",
          time: index === 0 ? "hoy" : index === 1 ? "hace 2 horas" : "hace 1 día"
        }))
      : [
          {
            title: "Sin actividad reciente",
            detail: "Aún no hay eventos nuevos en tu panel familiar.",
            time: "ahora"
          }
        ];

  return (
    <DashboardShell
      title="Panel de familias"
      subtitle="Administra favoritos, comparaciones, alertas y próximos pasos para tu decisión educativa."
    >
      <div className="space-y-6">
        <Card className="space-y-3 border-brand-100 bg-white/95">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-700">Decisión con confianza</p>
          <p className="text-sm text-slate-700">
            Tu panel prioriza colegios según tus acciones guardadas, comparaciones activas y alertas pendientes.
          </p>
          <div className="grid gap-2 md:grid-cols-3">
            <DataEvidence
              label="Fuente"
              value="Favoritos + comparador + alertas"
              context="Se actualiza en cada interacción"
            />
            <DataEvidence
              label="Última actualización"
              value={new Date().toLocaleDateString("es-AR")}
              context="Refresco automático del panel"
            />
            <DataEvidence
              label="Etapa actual"
              value={nextAction.title}
              context={`Estado: ${nextAction.stage}`}
            />
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-4">
          <MetricTile label="Favoritos" value={String(metrics.savedSchools)} />
          <MetricTile label="Comparaciones" value={String(metrics.activeComparisons)} />
          <MetricTile label="Alertas" value={String(metrics.unreadAlerts)} />
          <MetricTile label="Próximo evento" value={metrics.nextOpenHouse ? metrics.nextOpenHouse : "Sin agenda"} />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-ink">Colegios guardados</h2>
              <Link href="/search" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
                Buscar más colegios
              </Link>
            </div>

            {savedSchools.length === 0 ? (
              <p className="text-sm text-slate-600">
                Todavía no guardaste colegios. Explora resultados y usa el botón Guardar para construir tu shortlist.
              </p>
            ) : (
              <ul className="space-y-3">
                {savedSchools.map((item) => (
                  <li key={item.id} className="rounded-xl border border-brand-100 p-3">
                    <Link
                      href={citySchoolProfilePath(item.school.province, item.school.city, item.school.slug) as never}
                      className="font-semibold text-ink hover:text-brand-700"
                    >
                      {item.school.name}
                    </Link>
                    <p className="text-sm text-slate-600">
                      {item.school.city}, {item.school.province}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Cuota estimada:{" "}
                      <span className="font-medium text-ink">{formatCurrency(item.school.monthlyFeeEstimate)}</span>
                    </p>
                    <p className="text-sm text-slate-600">
                      Rating padres: <span className="font-medium text-ink">{formatRating(item.school.rating.average)}</span>{" "}
                      ({item.school.rating.count} reseñas)
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <div className="space-y-4">
            <Card className="space-y-3">
              <h2 className="text-lg font-semibold text-ink">Comparaciones guardadas</h2>
              {savedComparisons.length === 0 ? (
                <p className="text-sm text-slate-600">
                  Aún no guardaste comparaciones. Usa el comparador para guardar combinaciones de colegios.
                </p>
              ) : (
                <ul className="space-y-2">
                  {savedComparisons.map((comparison) => (
                    <li key={comparison.id} className="rounded-xl border border-brand-100 p-3">
                      <p className="text-sm font-semibold text-ink">
                        {comparison.schools.map((school) => school.name).join(" vs ")}
                      </p>
                      <div className="mt-2">
                        <Link
                          href={comparison.comparePath as never}
                          className="text-sm font-semibold text-brand-700 hover:text-brand-800"
                        >
                          Abrir comparación
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
            <Card className="space-y-3">
              <h2 className="text-lg font-semibold text-ink">Alertas</h2>
              <ParentAlertsPanel initialItems={alerts} />
            </Card>
            <Card className="space-y-3">
              <h2 className="text-lg font-semibold text-ink">Siguiente paso</h2>
              <p className="text-sm font-semibold text-ink">{nextAction.title}</p>
              <p className="text-sm text-slate-600">{nextAction.detail}</p>
              <div>
                <Link href={nextAction.ctaPath as never} className="text-sm font-semibold text-brand-700 hover:text-brand-800">
                  {nextAction.ctaLabel}
                </Link>
              </div>
            </Card>
            <RecentActivity items={activity} />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
