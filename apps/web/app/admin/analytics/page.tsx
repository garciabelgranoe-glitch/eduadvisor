import { LeadTrendChart } from "@/components/dashboard/lead-trend-chart";
import { Card } from "@/components/ui/card";
import { MetricTile } from "@/components/ui/metric-tile";
import { getAdminGrowthFunnel, getAdminOverview } from "@/lib/api";
import type { AdminOverviewResponse } from "@/lib/api";
import { getAnalyticsSnapshot } from "@/lib/server/analytics-store";
import { getPerformanceAlertChannelStatus, listPerformanceAlertDispatches } from "@/lib/server/performance-alerting";

export const dynamic = "force-dynamic";

function buildFallbackOverview(): AdminOverviewResponse {
  return {
    schools: { total: 0, active: 0, inactive: 0 },
    reviews: {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: 0,
      response: {
        responded: 0,
        awaitingResponse: 0,
        responseCoverageRate: 0,
        averageResponseHours: null,
        responsesWithinSla: 0,
        withinSlaRate: 0,
        pendingSlaBreaches: 0,
        respondingSchools: 0,
        schoolsWithApprovedReviews: 0,
        schoolAdoptionRate: 0
      }
    },
    claims: {
      total: 0,
      byStatus: {
        PENDING: 0,
        UNDER_REVIEW: 0,
        APPROVED: 0,
        REJECTED: 0
      }
    },
    leads: {
      total: 0,
      byStatus: {
        NEW: 0,
        CONTACTED: 0,
        QUALIFIED: 0,
        CLOSED: 0
      },
      conversionRate: 0
    },
    leadTrend: [],
    topCities: []
  };
}

export default async function AdminAnalyticsPage() {
  const [overviewResponse, analytics, growthFunnel, performanceDispatches, performanceChannelStatus] = await Promise.all([
    getAdminOverview(),
    getAnalyticsSnapshot(7),
    getAdminGrowthFunnel({ windowDays: "30", trendDays: "14" }),
    listPerformanceAlertDispatches(8),
    Promise.resolve(getPerformanceAlertChannelStatus())
  ]);
  const overview = overviewResponse ?? buildFallbackOverview();

  const formatRate = (value: number) => `${value.toFixed(2)}%`;
  const formatVital = (value: number | null, unit: "ms" | "score") => {
    if (value === null) {
      return "-";
    }

    if (unit === "score") {
      return value.toFixed(3);
    }

    return `${Math.round(value)} ms`;
  };
  const formatBudget = (value: number, unit: "ms" | "score") => {
    return unit === "score" ? value.toFixed(3) : `${Math.round(value)} ms`;
  };
  const cwvStatusLabel =
    analytics.webVitals.budgetStatus === "PASS"
      ? "Estable"
      : analytics.webVitals.budgetStatus === "WARN"
        ? "Degradado"
        : "Crítico";
  const cwvStatusClass =
    analytics.webVitals.budgetStatus === "PASS"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : analytics.webVitals.budgetStatus === "WARN"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-red-200 bg-red-50 text-red-800";
  const activeVitalAlerts = analytics.webVitals.alerts.filter((alert) => alert.status !== "PASS");

  return (
    <div className="space-y-6">
      {!overviewResponse ? (
        <Card className="border-amber-200 bg-amber-50/70 text-sm text-amber-900">
          No se pudo conectar con el resumen del backend. Mostrando panel con datos parciales de tracking.
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <MetricTile label="Búsquedas (7d)" value={String(analytics.totals.searches)} />
        <MetricTile label="Perfiles vistos (7d)" value={String(analytics.totals.profileViews)} />
        <MetricTile label="Shortlists guardadas (7d)" value={String(analytics.totals.savedSchools)} />
        <MetricTile label="Comparaciones guardadas (7d)" value={String(analytics.totals.comparisons)} />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricTile label="Leads enviados (7d)" value={String(analytics.totals.leads)} />
        <MetricTile label="Conv. búsqueda→lead" value={formatRate(analytics.conversion.searchToLeadRate)} />
        <MetricTile label="Conv. búsqueda→perfil" value={formatRate(analytics.conversion.searchToProfileRate)} />
        <MetricTile label="Conv. perfil→lead" value={formatRate(analytics.conversion.profileToLeadRate)} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricTile label="Eventos capturados (7d)" value={String(analytics.meta.trackedEvents)} />
        <MetricTile label="Eventos funnel (7d)" value={String(analytics.meta.trackedFunnelEvents)} />
        <MetricTile
          label="Posthog"
          value={analytics.meta.posthogEnabled ? "Configurado" : "Solo local"}
        />
      </div>

      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-ink">Core Web Vitals ({analytics.webVitals.windowDays} días)</h2>
        <div className="flex items-center gap-2 text-sm">
          <span className={`rounded-full border px-2 py-1 ${cwvStatusClass}`}>
            Estado de performance: {cwvStatusLabel}
          </span>
          <span className="text-slate-500">
            Min muestras por métrica: {analytics.webVitals.minSamplesForBudget}
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          <MetricTile label="LCP p75" value={formatVital(analytics.webVitals.p75.LCP, "ms")} />
          <MetricTile label="CLS p75" value={formatVital(analytics.webVitals.p75.CLS, "score")} />
          <MetricTile label="INP p75" value={formatVital(analytics.webVitals.p75.INP, "ms")} />
          <MetricTile label="FCP p75" value={formatVital(analytics.webVitals.p75.FCP, "ms")} />
          <MetricTile label="TTFB p75" value={formatVital(analytics.webVitals.p75.TTFB, "ms")} />
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          <MetricTile
            label="Muestras LCP"
            value={`${analytics.webVitals.samples.LCP} (${analytics.webVitals.quality.LCP.good} buenas)`}
          />
          <MetricTile
            label="Muestras CLS"
            value={`${analytics.webVitals.samples.CLS} (${analytics.webVitals.quality.CLS.good} buenas)`}
          />
          <MetricTile
            label="Muestras INP"
            value={`${analytics.webVitals.samples.INP} (${analytics.webVitals.quality.INP.good} buenas)`}
          />
          <MetricTile
            label="Muestras FCP"
            value={`${analytics.webVitals.samples.FCP} (${analytics.webVitals.quality.FCP.good} buenas)`}
          />
          <MetricTile
            label="Muestras TTFB"
            value={`${analytics.webVitals.samples.TTFB} (${analytics.webVitals.quality.TTFB.good} buenas)`}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          <MetricTile
            label="Objetivo LCP"
            value={`${formatBudget(analytics.webVitals.budgets.LCP.target, "ms")} / ${formatBudget(analytics.webVitals.budgets.LCP.max, "ms")}`}
          />
          <MetricTile
            label="Objetivo CLS"
            value={`${formatBudget(analytics.webVitals.budgets.CLS.target, "score")} / ${formatBudget(analytics.webVitals.budgets.CLS.max, "score")}`}
          />
          <MetricTile
            label="Objetivo INP"
            value={`${formatBudget(analytics.webVitals.budgets.INP.target, "ms")} / ${formatBudget(analytics.webVitals.budgets.INP.max, "ms")}`}
          />
          <MetricTile
            label="Objetivo FCP"
            value={`${formatBudget(analytics.webVitals.budgets.FCP.target, "ms")} / ${formatBudget(analytics.webVitals.budgets.FCP.max, "ms")}`}
          />
          <MetricTile
            label="Objetivo TTFB"
            value={`${formatBudget(analytics.webVitals.budgets.TTFB.target, "ms")} / ${formatBudget(analytics.webVitals.budgets.TTFB.max, "ms")}`}
          />
        </div>
        {activeVitalAlerts.length === 0 ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Sin alertas activas de performance en la ventana analizada.
          </div>
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p className="font-medium">Alertas activas de performance</p>
            <ul className="mt-2 space-y-1">
              {activeVitalAlerts.map((alert) => (
                <li key={`${alert.metric}-${alert.status}-${alert.message}`}>
                  • {alert.metric}: {alert.message} · p75 {formatVital(alert.p75, alert.budget.unit)} · samples{" "}
                  {alert.samples}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">Alertas de performance enviadas</h2>
        <p className="text-sm text-slate-600">
          Canales: Slack {performanceChannelStatus.slackConfigured ? "configurado" : "no configurado"} · Email webhook{" "}
          {performanceChannelStatus.emailWebhookConfigured ? "configurado" : "no configurado"} · dedupe{" "}
          {performanceChannelStatus.dedupeWindowMinutes} min
        </p>
        {performanceDispatches.length === 0 ? (
          <p className="text-sm text-slate-600">Aún no hay envíos de alertas de performance.</p>
        ) : (
          <ul className="space-y-2 text-sm text-slate-600">
            {performanceDispatches.map((item) => (
              <li key={item.id}>
                • {new Date(item.emittedAt).toLocaleString("es-AR")} · {item.budgetStatus} · source={item.source} ·
                Slack {item.channels.slack} · Email {item.channels.emailWebhook}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricTile label="Reseñas totales" value={String(overview.reviews.total)} />
        <MetricTile label="Aprobadas" value={String(overview.reviews.approved)} />
        <MetricTile label="Pendientes" value={String(overview.reviews.pending)} />
        <MetricTile label="Conversión leads" value={`${overview.leads.conversionRate}%`} />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricTile label="Reseñas respondidas" value={String(overview.reviews.response.responded)} />
        <MetricTile label="Cobertura de respuesta" value={`${overview.reviews.response.responseCoverageRate}%`} />
        <MetricTile
          label="Tiempo medio respuesta"
          value={
            overview.reviews.response.averageResponseHours === null
              ? "-"
              : `${overview.reviews.response.averageResponseHours} h`
          }
        />
        <MetricTile label="Cumplimiento SLA (72h)" value={`${overview.reviews.response.withinSlaRate}%`} />
      </div>

      {growthFunnel ? (
        <>
          <div className="grid gap-4 md:grid-cols-5">
            <MetricTile label="Padres base" value={String(growthFunnel.stages.parentsTotal)} />
            <MetricTile label="Con shortlist" value={String(growthFunnel.stages.parentsWithSavedSchools)} />
            <MetricTile label="Con comparación" value={String(growthFunnel.stages.parentsWithComparisons)} />
            <MetricTile label="Con leads" value={String(growthFunnel.stages.parentsWithLeads)} />
            <MetricTile label="Lead cerrado" value={String(growthFunnel.stages.parentsWithClosedLeads)} />
          </div>

          <div className="grid gap-4 md:grid-cols-5">
            <MetricTile label="Conv. a shortlist" value={formatRate(growthFunnel.conversion.toSaved)} />
            <MetricTile label="Conv. a comparación" value={formatRate(growthFunnel.conversion.toCompared)} />
            <MetricTile label="Conv. a lead" value={formatRate(growthFunnel.conversion.toLead)} />
            <MetricTile label="Conv. a lead cerrado" value={formatRate(growthFunnel.conversion.toClosedLead)} />
            <MetricTile label="Conv. total" value={formatRate(growthFunnel.conversion.overallToClosedLead)} />
          </div>
        </>
      ) : null}

      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-ink">Funnel de eventos (Posthog)</h2>
        <p className="text-sm text-slate-600">
          Versión de tracking: <span className="font-medium text-ink">{analytics.funnel.version}</span>
        </p>
        <div className="grid gap-4 md:grid-cols-5">
          <MetricTile label="Usuarios con búsqueda" value={String(analytics.funnel.stages.searchUsers)} />
          <MetricTile label="Usuarios con perfil" value={String(analytics.funnel.stages.profileUsers)} />
          <MetricTile label="Usuarios con shortlist" value={String(analytics.funnel.stages.shortlistUsers)} />
          <MetricTile label="Usuarios con comparación" value={String(analytics.funnel.stages.comparisonUsers)} />
          <MetricTile label="Usuarios con lead" value={String(analytics.funnel.stages.leadUsers)} />
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          <MetricTile
            label="Conv. búsqueda→perfil"
            value={formatRate(analytics.funnel.conversion.searchToProfileRate)}
          />
          <MetricTile
            label="Conv. perfil→shortlist"
            value={formatRate(analytics.funnel.conversion.profileToShortlistRate)}
          />
          <MetricTile
            label="Conv. shortlist→comparación"
            value={formatRate(analytics.funnel.conversion.shortlistToComparisonRate)}
          />
          <MetricTile
            label="Conv. comparación→lead"
            value={formatRate(analytics.funnel.conversion.comparisonToLeadRate)}
          />
          <MetricTile
            label="Conv. búsqueda→lead"
            value={formatRate(analytics.funnel.conversion.searchToLeadRate)}
          />
        </div>
      </Card>

      <LeadTrendChart trend={overview.leadTrend} />

      <Card className="space-y-2">
        <h2 className="text-lg font-semibold text-ink">Embudo de producto (7 días)</h2>
        <ul className="space-y-1 text-sm text-slate-600">
          <li>• Búsquedas: {analytics.totals.searches}</li>
          <li>• Perfiles vistos: {analytics.totals.profileViews}</li>
          <li>• Leads enviados: {analytics.totals.leads}</li>
          <li>• Reseñas enviadas: {analytics.totals.reviews}</li>
          <li>• Solicitudes de colegio: {analytics.totals.schoolRequests}</li>
        </ul>
      </Card>

      {growthFunnel ? (
        <Card className="space-y-2">
          <h2 className="text-lg font-semibold text-ink">Embudo de crecimiento de padres (30 días)</h2>
          <ul className="space-y-1 text-sm text-slate-600">
            <li>• Drop-off antes de shortlist: {growthFunnel.dropOff.beforeSaved}</li>
            <li>• Drop-off antes de comparación: {growthFunnel.dropOff.beforeCompared}</li>
            <li>• Drop-off antes de lead: {growthFunnel.dropOff.beforeLead}</li>
            <li>• Drop-off antes de lead cerrado: {growthFunnel.dropOff.beforeClosedLead}</li>
          </ul>
          <div className="pt-2 text-sm text-slate-600">
            {growthFunnel.recommendations.map((item, index) => (
              <p key={`${index}-${item}`}>• {item}</p>
            ))}
          </div>
        </Card>
      ) : null}

      <Card className="space-y-2">
        <h2 className="text-lg font-semibold text-ink">Top colegios por intención</h2>
        {analytics.topSchools.length === 0 ? (
          <p className="text-sm text-slate-600">Aún no hay suficientes datos de eventos para rankear colegios.</p>
        ) : (
          <ul className="space-y-1 text-sm text-slate-600">
            {analytics.topSchools.map((item) => (
              <li key={item.schoolSlug}>
                • {item.schoolSlug}: {item.profileViews} vistas de perfil · {item.leads} leads
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="space-y-2">
        <h2 className="text-lg font-semibold text-ink">Ritmo diario de embudo (7 días)</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-brand-100 text-left text-slate-500">
                <th className="py-2 pr-3">Fecha</th>
                <th className="py-2 pr-3">Búsquedas</th>
                <th className="py-2 pr-3">Perfiles</th>
                <th className="py-2 pr-3">Leads</th>
                <th className="py-2 pr-3">Conv. b→l</th>
              </tr>
            </thead>
            <tbody>
              {analytics.trend.map((entry) => {
                const dayRate = entry.searches > 0 ? (entry.leads / entry.searches) * 100 : 0;
                return (
                  <tr key={entry.date} className="border-b border-brand-50 last:border-b-0">
                    <td className="py-2 pr-3">{entry.date}</td>
                    <td className="py-2 pr-3">{entry.searches}</td>
                    <td className="py-2 pr-3">{entry.profileViews}</td>
                    <td className="py-2 pr-3">{entry.leads}</td>
                    <td className="py-2 pr-3">{formatRate(dayRate)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="space-y-2">
        <h2 className="text-lg font-semibold text-ink">Estado de tracking</h2>
        <ul className="space-y-1 text-sm text-slate-600">
          <li>• Último evento capturado: {analytics.meta.lastCapturedAt ?? "Sin datos"}</li>
          <li>• Archivo local de eventos: {analytics.meta.filePath}</li>
          <li>• Posthog habilitado: {analytics.meta.posthogEnabled ? "sí" : "no"}</li>
          <li>• Versión funnel activa: {analytics.meta.funnelVersion}</li>
        </ul>
      </Card>

      <Card className="space-y-2">
        <h2 className="text-lg font-semibold text-ink">Calidad de respuesta a reseñas</h2>
        <ul className="space-y-1 text-sm text-slate-600">
          <li>• Reseñas aprobadas sin respuesta: {overview.reviews.response.awaitingResponse}</li>
          <li>• Brechas SLA abiertas (&gt;72h): {overview.reviews.response.pendingSlaBreaches}</li>
          <li>
            • Colegios que responden: {overview.reviews.response.respondingSchools}/
            {overview.reviews.response.schoolsWithApprovedReviews}
            {" "}
            ({overview.reviews.response.schoolAdoptionRate}%)
          </li>
          <li>• Respuestas dentro de SLA: {overview.reviews.response.responsesWithinSla}</li>
        </ul>
      </Card>

      <Card className="space-y-2">
        <h2 className="text-lg font-semibold text-ink">Distribución de leads</h2>
        <ul className="space-y-1 text-sm text-slate-600">
          <li>• NEW: {overview.leads.byStatus.NEW}</li>
          <li>• CONTACTED: {overview.leads.byStatus.CONTACTED}</li>
          <li>• QUALIFIED: {overview.leads.byStatus.QUALIFIED}</li>
          <li>• CLOSED: {overview.leads.byStatus.CLOSED}</li>
        </ul>
      </Card>
    </div>
  );
}
