import type { Metadata } from "next";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { LeadPipelineBoard } from "@/components/dashboard/lead-pipeline-board";
import { SchoolReviewResponseBoard } from "@/components/dashboard/school-review-response-board";
import { LeadTrendChart } from "@/components/dashboard/lead-trend-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { SchoolProfileEditor } from "@/components/dashboard/school-profile-editor";
import { PremiumUpgradeHighlight } from "@/components/school/premium-upgrade-highlight";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { MetricTile } from "@/components/ui/metric-tile";
import { Select } from "@/components/ui/select";
import { getSchoolBySlug, getSchoolDashboard, getSchools } from "@/lib/api";
import { APP_ROLE_SCHOOL_ADMIN } from "@/lib/auth/session";
import { getServerAuthSession } from "@/lib/auth/server-session";
import { formatCurrency, formatRating } from "@/lib/format";
import { pickParam, type RawSearchParams } from "@/lib/query-params";
import {
  canAccessPremiumFeatures,
  canManageSchoolByProfileStatus,
  managementUnlockMessage,
  premiumUnlockMessage
} from "@/lib/school-permissions";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Panel de colegio",
  description: "Panel para colegios con leads, perfil institucional y estadísticas comerciales.",
  canonicalPath: "/school-dashboard"
});

export const dynamic = "force-dynamic";

interface SchoolDashboardPageProps {
  searchParams?: RawSearchParams;
}

export default async function SchoolDashboardPage({ searchParams }: SchoolDashboardPageProps) {
  const referenceTimeIso = new Date().toISOString();
  const billingStatus = pickParam(searchParams?.billing);
  const billingMessage =
    billingStatus === "checkout_error"
      ? "No se pudo iniciar el checkout. Intenta nuevamente desde el panel."
      : billingStatus === "connection_error"
        ? "No se pudo conectar con el módulo de facturación."
        : billingStatus === "missing_school"
          ? "Falta el colegio objetivo para iniciar checkout."
          : null;

  const session = await getServerAuthSession();
  const sessionSchoolSlug = session?.role === APP_ROLE_SCHOOL_ADMIN ? session.schoolSlug : null;
  const requestedSlug = pickParam(searchParams?.school)?.trim().toLowerCase();
  const schoolsResponse = await getSchools({ country: "AR", limit: "50", sortBy: "name", sortOrder: "asc" });
  const allSchools = schoolsResponse.items.map((item) => ({
    slug: item.slug,
    name: item.name,
    city: item.location.city
  }));
  const availableSchools = sessionSchoolSlug
    ? allSchools.filter((item) => item.slug === sessionSchoolSlug)
    : allSchools;
  const defaultSlug = availableSchools[0]?.slug;
  const initialSlug = sessionSchoolSlug || requestedSlug || defaultSlug;

  if (!initialSlug) {
    return (
      <DashboardShell
        title="Panel de colegio"
        subtitle="Todavía no hay colegios cargados para visualizar el panel."
      >
        <Card className="text-sm text-slate-600">
          Todavía no hay colegios disponibles. Contactá al equipo de EduAdvisor para comenzar.
        </Card>
      </DashboardShell>
    );
  }

  let activeSlug = initialSlug;
  let schoolPublic = await getSchoolBySlug(activeSlug);

  if (!schoolPublic && defaultSlug && activeSlug !== defaultSlug) {
    activeSlug = defaultSlug;
    schoolPublic = await getSchoolBySlug(defaultSlug);
  }

  if (!schoolPublic) {
    return (
      <DashboardShell
        title="Panel de colegio"
        subtitle="No se encontró el colegio solicitado."
      >
        <Card className="text-sm text-slate-600">
          No encontramos el colegio solicitado. Intentá nuevamente o contactá al equipo de EduAdvisor.
        </Card>
      </DashboardShell>
    );
  }

  const dashboard = await getSchoolDashboard(schoolPublic.id);

  if (!dashboard) {
    return (
      <DashboardShell
        title={`Panel · ${schoolPublic.name}`}
        subtitle="No se pudo cargar el panel privado del colegio."
      >
        <Card className="text-sm text-slate-600">
          No pudimos cargar tu panel. Por favor intentá nuevamente en unos minutos.
        </Card>
      </DashboardShell>
    );
  }

  const activity = dashboard.recentLeads.slice(0, 4).map((lead) => ({
    title: `Lead de ${lead.parentName}`,
    detail: `${lead.educationLevel} · ${lead.childAge} años · ${lead.status}`,
    time: new Date(lead.createdAt).toLocaleString("es-AR")
  }));

  const managementEnabled = canManageSchoolByProfileStatus(dashboard.school.profile.status);
  const premiumEnabled = canAccessPremiumFeatures(dashboard.school.profile.status);
  const canClaimProfile =
    dashboard.school.profile.status === "BASIC" || dashboard.school.profile.status === "CURATED";
  const lockedMessage = managementUnlockMessage(dashboard.school.profile.status);
  const premiumMessage = premiumUnlockMessage(dashboard.school.profile.status);
  const currentPlan = dashboard.school.billing.currentPlan;

  const newLeadsCount = dashboard.stats.leadsByStatus.NEW;
  const hasNewLeads = newLeadsCount > 0;
  const profileCompleteness = dashboard.stats.profileCompleteness;
  const profileIsLow = profileCompleteness < 60;

  return (
    <DashboardShell
      title={dashboard.school.name}
      subtitle="Panel de gestión · leads, perfil y métricas comerciales"
    >

      {/* Billing error banner */}
      {billingMessage && (
        <Card className="border-amber-200 bg-amber-50/70 text-sm text-amber-900">
          ⚠️ {billingMessage}
        </Card>
      )}

      {/* School selector — admin only */}
      {availableSchools.length > 1 && !sessionSchoolSlug && (
        <Card className="border-brand-100">
          <form className="flex flex-wrap items-end gap-3" action="/school-dashboard" method="get">
            <FormField label="Colegio activo" className="min-w-0 w-full sm:min-w-[280px]">
              <Select name="school" defaultValue={activeSlug}>
                {availableSchools.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.name} · {item.city}
                  </option>
                ))}
              </Select>
            </FormField>
            <Button type="submit" variant="ghost">Cambiar</Button>
          </form>
        </Card>
      )}

      {/* ── SECCIÓN 1: Estado del negocio ── */}
      <section className="space-y-3">
        <p className="ea-kicker">Resumen del período</p>

        {/* Lead highlight — protagonista cuando hay leads nuevos */}
        {hasNewLeads && (
          <div className="rounded-2xl border border-emerald-300 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 p-5 shadow-[0_8px_24px_rgba(16,185,129,0.12)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-[0_8px_20px_rgba(16,185,129,0.35)]">
                  <span className="text-2xl font-bold">{newLeadsCount}</span>
                </div>
                <div>
                  <p className="text-lg font-semibold text-emerald-900">
                    {newLeadsCount === 1 ? "1 lead nuevo sin responder" : `${newLeadsCount} leads nuevos sin responder`}
                  </p>
                  <p className="text-sm text-emerald-700">
                    Respondé antes de las 72 hs para mejorar tu tasa de conversión
                  </p>
                </div>
              </div>
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                <a href="#leads">Ver leads →</a>
              </Button>
            </div>
          </div>
        )}

        {/* Métricas principales — 3 datos clave, no 12 */}
        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile
            label="Leads totales"
            value={String(dashboard.stats.leadsTotal)}
            hint="consultas de familias recibidas"
            tone={hasNewLeads ? "positive" : "default"}
          />
          <MetricTile
            label="Tasa de cierre"
            value={`${dashboard.stats.conversionRate}%`}
            hint="leads convertidos en matrículas"
            tone={dashboard.stats.conversionRate >= 20 ? "positive" : "default"}
          />
          <MetricTile
            label="Perfil completo"
            value={`${profileCompleteness}%`}
            hint={profileIsLow ? "completar perfil mejora tu visibilidad" : "perfil bien optimizado"}
            tone={profileIsLow ? "warning" : "positive"}
          />
        </div>

        {/* Pipeline rápido — 4 estados en una fila más compacta */}
        <div className="grid grid-cols-2 divide-x divide-y divide-brand-100 overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-[0_4px_12px_rgba(13,27,31,0.05)] sm:grid-cols-4 sm:divide-y-0">
          {[
            { label: "Nuevos", value: dashboard.stats.leadsByStatus.NEW, urgent: true },
            { label: "Contactados", value: dashboard.stats.leadsByStatus.CONTACTED, urgent: false },
            { label: "Calificados", value: dashboard.stats.leadsByStatus.QUALIFIED, urgent: false },
            { label: "Cerrados", value: dashboard.stats.leadsByStatus.CLOSED, urgent: false }
          ].map((item) => (
            <div key={item.label} className="px-3 py-4 text-center sm:px-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                {item.label}
              </p>
              <p className={`mt-1 text-2xl font-bold ${item.urgent && item.value > 0 ? "text-emerald-700" : "text-ink"}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECCIÓN 2: Plan y facturación ── */}
      <section className="space-y-3">
        <p className="ea-kicker">Plan comercial</p>
        <div className={`rounded-2xl border p-5 ${premiumEnabled ? "border-amber-300 bg-gradient-to-r from-amber-50 to-white" : "border-slate-200 bg-slate-50/60"}`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold text-ink">
                  {currentPlan ? currentPlan.planCode.toUpperCase() : "Sin plan activo"}
                </p>
                {premiumEnabled && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-700">
                    Premium
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600">
                {currentPlan
                  ? `${formatCurrency(currentPlan.priceMonthly)}/mes · vence ${currentPlan.endsAt ? currentPlan.endsAt.slice(0, 10) : "sin fecha"}`
                  : "Activá Premium para recibir leads y acceder a estadísticas completas"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {dashboard.school.billing.entitlements.canUsePremiumLeadExport ? (
                <Button asChild variant="ghost" size="sm">
                  <a href={`/api/schools/leads-export?schoolId=${encodeURIComponent(dashboard.school.id)}`}>
                    Exportar leads CSV
                  </a>
                </Button>
              ) : (
                <Button asChild variant="secondary" size="sm">
                  <a href={`/api/schools/billing/checkout?schoolId=${encodeURIComponent(dashboard.school.id)}&school=${encodeURIComponent(dashboard.school.slug)}`}>
                    Activar Premium →
                  </a>
                </Button>
              )}
            </div>
          </div>

          {!premiumEnabled && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-white/80 p-3">
              <p className="text-xs font-semibold text-amber-800">{premiumMessage}</p>
            </div>
          )}
        </div>
      </section>

      {/* ── SECCIÓN 3: Acceso restringido ── */}
      {!managementEnabled && (
        <Card className="border-amber-200 bg-amber-50/70 space-y-2">
          <p className="ea-kicker text-amber-700">Acceso restringido</p>
          <p className="text-sm text-amber-900">{lockedMessage}</p>
          <p className="text-sm text-amber-800">
            Activá claim y verificación desde el{" "}
            <Link href={`/school/${activeSlug}`} className="font-semibold underline underline-offset-2">
              perfil público del colegio
            </Link>{" "}
            para desbloquear estas funciones.
          </p>
        </Card>
      )}

      {/* Upgrade CTA — solo si no tiene premium */}
      {!premiumEnabled && (
        <PremiumUpgradeHighlight
          schoolName={dashboard.school.name}
          schoolSlug={dashboard.school.slug}
          schoolId={dashboard.school.id}
          canClaimProfile={canClaimProfile}
          surface="school_dashboard"
        />
      )}

      {/* ── SECCIÓN 4: Leads ── */}
      <section id="leads" className="scroll-mt-6 space-y-3">
        <p className="ea-kicker">Pipeline de leads</p>
        <LeadPipelineBoard
          initialLeads={dashboard.recentLeads}
          schoolId={dashboard.school.id}
          canManageLeads={managementEnabled}
        />
      </section>

      {/* ── SECCIÓN 5: Tendencia + actividad ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <p className="ea-kicker">Tendencia de leads</p>
          <LeadTrendChart trend={dashboard.leadTrend} />
        </div>
        <div className="space-y-3">
          <p className="ea-kicker">Actividad reciente</p>
          <RecentActivity
            items={
              activity.length > 0
                ? activity
                : [{ title: "Sin actividad", detail: "Aún no hay leads para mostrar.", time: "ahora" }]
            }
          />
        </div>
      </div>

      {/* ── SECCIÓN 6: Reseñas ── */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="ea-kicker">Reseñas de familias</p>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span>{dashboard.stats.reviewsApproved} aprobadas</span>
            <span>·</span>
            <span className={dashboard.stats.pendingReviewResponseSlaBreaches > 0 ? "font-semibold text-red-600" : ""}>
              {dashboard.stats.reviewsResponded} respondidas ({dashboard.stats.reviewResponseRate}%)
            </span>
            {dashboard.stats.averageReviewResponseHours !== null && (
              <>
                <span>·</span>
                <span>Tiempo medio: {dashboard.stats.averageReviewResponseHours} h</span>
              </>
            )}
          </div>
        </div>
        <SchoolReviewResponseBoard
          initialReviews={dashboard.recentReviews}
          schoolId={dashboard.school.id}
          canManageResponses={managementEnabled}
          referenceTimeIso={referenceTimeIso}
        />
      </section>

      {/* ── SECCIÓN 7: Perfil institucional ── */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="ea-kicker">Perfil institucional</p>
          <div className="flex items-center gap-2 text-sm">
            <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-brand-600 transition-all"
                style={{ width: `${profileCompleteness}%` }}
              />
            </div>
            <span className="font-semibold text-brand-700">{profileCompleteness}% completo</span>
          </div>
        </div>
        <SchoolProfileEditor
          school={dashboard.school}
          isEditable={managementEnabled}
          isPremium={premiumEnabled}
        />
      </section>

      {/* Datos secundarios — al fondo */}
      <section className="space-y-3">
        <p className="ea-kicker">Datos institucionales</p>
        <Card className="border-brand-100">
          <ul className="grid gap-y-2 text-sm text-slate-600 sm:grid-cols-2">
            <li className="flex justify-between gap-2 border-b border-brand-50 pb-2 sm:border-b-0">
              <span className="text-slate-400">Cuota estimada</span>
              <span className="font-semibold text-ink">{formatCurrency(dashboard.school.monthlyFeeEstimate) ?? "—"}</span>
            </li>
            <li className="flex justify-between gap-2 border-b border-brand-50 pb-2 sm:border-b-0">
              <span className="text-slate-400">Alumnos</span>
              <span className="font-semibold text-ink">{dashboard.school.studentsCount ?? "No informado"}</span>
            </li>
            <li className="flex justify-between gap-2 border-b border-brand-50 pb-2 sm:border-b-0">
              <span className="text-slate-400">Rating promedio</span>
              <span className="font-semibold text-ink">{formatRating(dashboard.stats.ratingAverage) ?? "—"}</span>
            </li>
            <li className="flex justify-between gap-2">
              <span className="text-slate-400">SLA vencido (&gt;72 h sin respuesta)</span>
              <span className={`font-semibold ${dashboard.stats.pendingReviewResponseSlaBreaches > 0 ? "text-red-600" : "text-ink"}`}>
                {dashboard.stats.pendingReviewResponseSlaBreaches}
              </span>
            </li>
          </ul>
        </Card>
      </section>

    </DashboardShell>
  );
}
