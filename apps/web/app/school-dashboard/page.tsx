import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { LeadPipelineBoard } from "@/components/dashboard/lead-pipeline-board";
import { SchoolReviewResponseBoard } from "@/components/dashboard/school-review-response-board";
import { LeadTrendChart } from "@/components/dashboard/lead-trend-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { SchoolProfileEditor } from "@/components/dashboard/school-profile-editor";
import { PremiumUpgradeHighlight } from "@/components/school/premium-upgrade-highlight";
import { TrustStrip } from "@/components/school/trust-strip";
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
          Importá colegios desde Google o cargalos manualmente para habilitar esta vista.
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
        subtitle="No se encontró el colegio solicitado para visualizar el panel."
      >
        <Card className="text-sm text-slate-600">
          Revisá el slug en query param (`?school=&lt;slug&gt;`) o seleccioná otro colegio.
        </Card>
      </DashboardShell>
    );
  }

  const dashboard = await getSchoolDashboard(schoolPublic.id);

  if (!dashboard) {
    return (
      <DashboardShell
        title={`Panel de colegio · ${schoolPublic.name}`}
        subtitle="No se pudo cargar el panel privado del colegio."
      >
        <Card className="text-sm text-slate-600">
          Verifica `ADMIN_API_KEY` y que el backend esté activo para consultar endpoints protegidos.
        </Card>
      </DashboardShell>
    );
  }

  const activity = dashboard.recentLeads.slice(0, 4).map((lead) => ({
    title: `Lead de ${lead.parentName}`,
    detail: `${lead.educationLevel} · ${lead.childAge} años · ${lead.status}`,
    time: new Date(lead.createdAt).toLocaleString("es-AR")
  }));
  const averageReviewResponseTimeLabel =
    dashboard.stats.averageReviewResponseHours === null ? "-" : `${dashboard.stats.averageReviewResponseHours} h`;
  const managementEnabled = canManageSchoolByProfileStatus(dashboard.school.profile.status);
  const premiumEnabled = canAccessPremiumFeatures(dashboard.school.profile.status);
  const canClaimProfile =
    dashboard.school.profile.status === "BASIC" || dashboard.school.profile.status === "CURATED";
  const lockedMessage = managementUnlockMessage(dashboard.school.profile.status);
  const premiumMessage = premiumUnlockMessage(dashboard.school.profile.status);
  const currentPlan = dashboard.school.billing.currentPlan;

  return (
    <DashboardShell
      title={`Panel de colegio · ${dashboard.school.name}`}
      subtitle="Gestiona leads, actualiza perfil institucional y monitorea métricas clave del colegio."
    >
      <div className="space-y-6">
        {billingMessage ? (
          <Card className="border-amber-200 bg-amber-50/70 text-sm text-amber-900">{billingMessage}</Card>
        ) : null}

        <Card className="space-y-3 border-brand-100 bg-white/95">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-700">Confianza operativa</p>
          <TrustStrip
            profileStatus={dashboard.school.profile.status}
            profileLabel={dashboard.school.profile.label}
            verifiedAt={dashboard.school.profile.verifiedAt}
            updatedAt={dashboard.school.profile.curatedAt ?? dashboard.school.profile.verifiedAt}
            sourceLabel="Datos institucionales + actividad comercial del colegio"
            methodologyHref="/market-insights"
          />
          <p className="text-xs text-slate-500">
            Estas métricas combinan datos de perfil, leads y reseñas para priorizar decisiones de captación.
          </p>
        </Card>

        {availableSchools.length > 1 && !sessionSchoolSlug ? (
          <Card className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-700">Contexto</p>
            <form className="flex flex-wrap items-end gap-3" action="/school-dashboard" method="get">
              <FormField label="Colegio activo" className="min-w-[280px]">
                <Select name="school" defaultValue={activeSlug}>
                  {availableSchools.map((item) => (
                    <option key={item.slug} value={item.slug}>
                      {item.name} · {item.city}
                    </option>
                  ))}
                </Select>
              </FormField>
              <Button type="submit" variant="ghost">
                Cambiar
              </Button>
            </form>
          </Card>
        ) : null}

        <div className="grid gap-4 md:grid-cols-4">
          <MetricTile label="Leads totales" value={String(dashboard.stats.leadsTotal)} />
          <MetricTile label="Tasa de cierre" value={`${dashboard.stats.conversionRate}%`} />
          <MetricTile label="Rating promedio" value={formatRating(dashboard.stats.ratingAverage)} />
          <MetricTile label="Perfil completo" value={`${dashboard.stats.profileCompleteness}%`} />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <MetricTile label="Nuevos" value={String(dashboard.stats.leadsByStatus.NEW)} />
          <MetricTile label="Contactados" value={String(dashboard.stats.leadsByStatus.CONTACTED)} />
          <MetricTile label="Calificados" value={String(dashboard.stats.leadsByStatus.QUALIFIED)} />
          <MetricTile label="Cerrados" value={String(dashboard.stats.leadsByStatus.CLOSED)} />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <MetricTile label="Reseñas aprobadas" value={String(dashboard.stats.reviewsApproved)} />
          <MetricTile label="Respondidas" value={String(dashboard.stats.reviewsResponded)} />
          <MetricTile label="Cobertura de respuesta" value={`${dashboard.stats.reviewResponseRate}%`} />
          <MetricTile label="Tiempo medio de respuesta" value={averageReviewResponseTimeLabel} />
        </div>

        <Card className="space-y-3">
          <h3 className="text-lg font-semibold text-ink">Plan comercial</h3>
          <div className="grid gap-3 md:grid-cols-4">
            <MetricTile
              label="Plan"
              value={currentPlan ? currentPlan.planCode.toUpperCase() : "SIN PLAN"}
            />
            <MetricTile
              label="Estado"
              value={currentPlan ? currentPlan.status : dashboard.school.profile.status}
            />
            <MetricTile
              label="Precio mensual"
              value={currentPlan ? formatCurrency(currentPlan.priceMonthly) : "No informado"}
            />
            <MetricTile
              label="Vigencia"
              value={currentPlan?.endsAt ? currentPlan.endsAt.slice(0, 10) : "Sin vencimiento"}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`/api/schools/leads-export?schoolId=${encodeURIComponent(dashboard.school.id)}`}
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                dashboard.school.billing.entitlements.canUsePremiumLeadExport
                  ? "bg-brand-700 text-white hover:bg-brand-800"
                  : "cursor-not-allowed bg-slate-200 text-slate-500"
              }`}
              aria-disabled={!dashboard.school.billing.entitlements.canUsePremiumLeadExport}
            >
              Exportar leads CSV
            </a>
            {!dashboard.school.billing.entitlements.canUsePremiumLeadExport ? (
              <>
                <p className="text-sm text-slate-600">{premiumMessage}</p>
                <a
                  href={`/api/schools/billing/checkout?schoolId=${encodeURIComponent(dashboard.school.id)}&school=${encodeURIComponent(dashboard.school.slug)}`}
                  className="rounded-xl border border-brand-100 bg-white px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
                >
                  Iniciar checkout premium
                </a>
              </>
            ) : null}
          </div>
        </Card>

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <Card className="space-y-2">
            <h3 className="text-lg font-semibold text-ink">Resumen institucional</h3>
            <ul className="space-y-1 text-sm text-slate-600">
              <li>• Cuota estimada: {formatCurrency(dashboard.school.monthlyFeeEstimate)}</li>
              <li>• Alumnos: {dashboard.school.studentsCount ?? "No informado"}</li>
              <li>• Reseñas aprobadas: {dashboard.stats.reviewsApproved}</li>
              <li>• Reseñas pendientes: {dashboard.stats.reviewsPending}</li>
              <li>• SLA vencido (72h sin respuesta): {dashboard.stats.pendingReviewResponseSlaBreaches}</li>
            </ul>
          </Card>
          <LeadTrendChart trend={dashboard.leadTrend} />
        </div>

        {!managementEnabled ? (
          <Card className="space-y-2 border-amber-200 bg-amber-50/70">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-700">Acceso restringido</p>
            <p className="text-sm text-amber-900">{lockedMessage}</p>
            <p className="text-sm text-amber-800">
              Activa claim y verificación desde el perfil público del colegio para desbloquear estas funciones.
            </p>
          </Card>
        ) : null}

        {!premiumEnabled ? (
          <PremiumUpgradeHighlight
            schoolName={dashboard.school.name}
            schoolSlug={dashboard.school.slug}
            schoolId={dashboard.school.id}
            canClaimProfile={canClaimProfile}
            surface="school_dashboard"
          />
        ) : null}

        <SchoolProfileEditor school={dashboard.school} isEditable={managementEnabled} isPremium={premiumEnabled} />

        <LeadPipelineBoard
          initialLeads={dashboard.recentLeads}
          schoolId={dashboard.school.id}
          canManageLeads={managementEnabled}
        />

        <Card className="space-y-3">
          <h3 className="text-lg font-semibold text-ink">Respuesta a reseñas</h3>
          <p className="text-sm text-slate-600">
            Gestioná respuestas públicas para reseñas aprobadas y fortalecé la confianza con familias.
          </p>
          <SchoolReviewResponseBoard
            initialReviews={dashboard.recentReviews}
            schoolId={dashboard.school.id}
            canManageResponses={managementEnabled}
            referenceTimeIso={referenceTimeIso}
          />
        </Card>

        <RecentActivity
          items={
            activity.length > 0
              ? activity
              : [{ title: "Sin actividad", detail: "Aún no hay leads para mostrar.", time: "ahora" }]
          }
        />
      </div>
    </DashboardShell>
  );
}
