import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { ParentAlertsPanel } from "@/components/parent/parent-alerts-panel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

const stageLabels: Record<string, { label: string; color: string }> = {
  DISCOVERY:    { label: "Explorando", color: "bg-slate-100 text-slate-600" },
  SHORTLISTING: { label: "Armando shortlist", color: "bg-brand-50 text-brand-700" },
  COMPARING:    { label: "Comparando", color: "bg-blue-50 text-blue-700" },
  DECIDING:     { label: "Decidiendo", color: "bg-amber-50 text-amber-700" },
  ENROLLED:     { label: "Matriculado ✓", color: "bg-emerald-50 text-emerald-700" }
};

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

  const activity = savedSchools.length > 0
    ? savedSchools.slice(0, 4).map((item, i) => ({
        title: i === 0 ? `Guardaste ${item.school.name}` : i === 1 ? `Comparación sugerida: ${item.school.name}` : `Seguimiento: ${item.school.name}`,
        detail: i === 0 ? `${item.school.city}, ${item.school.province}` : i === 1 ? "Agregalo al comparador para evaluar cuota y ratings." : "Monitoreá cambios y nuevas reseñas.",
        time: i === 0 ? "hoy" : i === 1 ? "hace 2 hs" : "hace 1 día"
      }))
    : [{ title: "Sin actividad reciente", detail: "Aún no hay eventos en tu panel.", time: "ahora" }];

  const stageInfo = stageLabels[nextAction.stage] ?? stageLabels.DISCOVERY;

  return (
    <DashboardShell
      title="Mi panel"
      subtitle="Favoritos, comparaciones y alertas para tu decisión educativa."
    >
      {/* ── SIGUIENTE PASO — protagonista ── */}
      <section>
        <div className="overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-700 to-brand-800 p-5 text-white shadow-[0_12px_30px_rgba(31,92,77,0.25)] sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${stageInfo.color}`}>
                {stageInfo.label}
              </span>
              <h2 className="font-display text-2xl text-white">{nextAction.title}</h2>
              <p className="max-w-lg text-sm leading-relaxed text-white/75">{nextAction.detail}</p>
            </div>
            <Button
              asChild
              className="shrink-0 bg-amber-400 text-amber-950 hover:bg-amber-300"
            >
              <Link href={nextAction.ctaPath as never}>{nextAction.ctaLabel} →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── MÉTRICAS RÁPIDAS ── */}
      <section>
        <div className="grid grid-cols-3 divide-x divide-brand-100 overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-[0_4px_12px_rgba(13,27,31,0.05)]">
          <div className="px-4 py-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Favoritos</p>
            <p className="mt-1 text-3xl font-bold text-ink">{metrics.savedSchools}</p>
          </div>
          <div className="px-4 py-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Comparaciones</p>
            <p className="mt-1 text-3xl font-bold text-ink">{metrics.activeComparisons}</p>
          </div>
          <div className="px-4 py-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Alertas</p>
            <p className={`mt-1 text-3xl font-bold ${unreadAlerts > 0 ? "text-emerald-700" : "text-ink"}`}>
              {unreadAlerts > 0 ? unreadAlerts : metrics.unreadAlerts}
            </p>
          </div>
        </div>
      </section>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">

        {/* Columna principal */}
        <div className="space-y-6">

          {/* Colegios guardados */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="ea-kicker">Mis favoritos</p>
              <Link href="/search" className="text-xs font-semibold text-brand-700 hover:underline">
                + Buscar más colegios
              </Link>
            </div>

            {savedSchools.length === 0 ? (
              <Card className="space-y-3 border-brand-100 text-center">
                <p className="text-3xl">🔍</p>
                <p className="font-semibold text-ink">Todavía no guardaste colegios</p>
                <p className="text-sm text-slate-600">
                  Explorá resultados y usá el botón Guardar para armar tu shortlist.
                </p>
                <Button asChild>
                  <Link href="/search">Explorar colegios</Link>
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {savedSchools.map((item) => {
                  const profilePath = citySchoolProfilePath(item.school.province, item.school.city, item.school.slug);
                  return (
                    <Card key={item.id} className="border-brand-100 p-4 transition-all hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(13,27,31,0.1)]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          <Link
                            href={profilePath as never}
                            className="font-display text-lg font-semibold text-ink hover:text-brand-700"
                          >
                            {item.school.name}
                          </Link>
                          <p className="text-sm text-slate-500">
                            {item.school.city}, {item.school.province}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="rounded-xl border border-brand-100 bg-brand-50/40 px-3 py-2 text-center">
                          <p className="text-[10px] uppercase tracking-widest text-slate-400">Cuota est.</p>
                          <p className="mt-0.5 text-sm font-bold text-ink">
                            {formatCurrency(item.school.monthlyFeeEstimate) ?? "—"}
                          </p>
                        </div>
                        <div className="rounded-xl border border-brand-100 bg-brand-50/40 px-3 py-2 text-center">
                          <p className="text-[10px] uppercase tracking-widest text-slate-400">Rating</p>
                          <p className="mt-0.5 text-sm font-bold text-ink">
                            {item.school.rating.average !== null
                              ? `⭐ ${formatRating(item.school.rating.average)}`
                              : "—"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <Button asChild size="sm" className="flex-1">
                          <Link href={profilePath as never}>Ver perfil</Link>
                        </Button>
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/compare?schools=${encodeURIComponent(item.school.slug)}` as never}>
                            Comparar
                          </Link>
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          {/* Comparaciones guardadas */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="ea-kicker">Comparaciones guardadas</p>
              <Link href="/compare" className="text-xs font-semibold text-brand-700 hover:underline">
                Nueva comparación
              </Link>
            </div>

            {savedComparisons.length === 0 ? (
              <Card className="border-brand-100 text-center space-y-3">
                <p className="text-3xl">⚖️</p>
                <p className="font-semibold text-ink">Sin comparaciones guardadas</p>
                <p className="text-sm text-slate-600">
                  Usá el comparador para evaluar hasta 3 colegios en una sola vista.
                </p>
                <Button asChild variant="secondary">
                  <Link href="/compare">Ir al comparador</Link>
                </Button>
              </Card>
            ) : (
              <div className="space-y-2">
                {savedComparisons.map((comparison) => (
                  <Card key={comparison.id} className="border-brand-100 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-ink truncate">
                          {comparison.schools.map((s) => s.name).join(" vs ")}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {comparison.schools.length} colegios comparados
                        </p>
                      </div>
                      <Button asChild size="sm" variant="ghost">
                        <Link href={comparison.comparePath as never}>Ver →</Link>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* Columna lateral */}
        <div className="space-y-5">

          {/* Alertas */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <p className="ea-kicker">Alertas</p>
              {unreadAlerts > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                  {unreadAlerts}
                </span>
              )}
            </div>
            <Card className="border-brand-100 p-0 overflow-hidden">
              <ParentAlertsPanel initialItems={alerts} />
            </Card>
          </section>

          {/* Actividad reciente */}
          <section className="space-y-3">
            <p className="ea-kicker">Actividad reciente</p>
            <RecentActivity items={activity} />
          </section>

          {/* CTA matching */}
          <Card className="space-y-3 border-brand-200 bg-gradient-to-br from-brand-50 to-white text-center">
            <p className="text-2xl">✨</p>
            <h3 className="font-display text-lg text-ink">¿Querés recomendaciones personalizadas?</h3>
            <p className="text-sm text-slate-600">
              Nuestro matching con IA analiza tus preferencias y te sugiere los mejores colegios.
            </p>
            <Button asChild className="w-full">
              <Link href="/matches">Probar matching →</Link>
            </Button>
          </Card>

        </div>
      </div>

    </DashboardShell>
  );
}
