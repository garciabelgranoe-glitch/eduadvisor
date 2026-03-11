import { Card } from "@/components/ui/card";
import { DataEvidence } from "@/components/ui/data-evidence";
import { MetricTile } from "@/components/ui/metric-tile";
import { getAdminOverview } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const overview = await getAdminOverview();

  if (!overview) {
    return (
      <Card className="text-sm text-slate-600">
        No se pudo cargar el panel administrador. Verificá backend y `ADMIN_API_KEY`.
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-3 border-brand-100 bg-white/95">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-700">Control con trazabilidad</p>
        <p className="text-sm text-slate-700">
          Este panel consolida estado operativo, calidad editorial y performance comercial de la plataforma.
        </p>
        <div className="grid gap-2 md:grid-cols-3">
          <DataEvidence label="Fuente" value="API admin + telemetría" context="Datos internos de operación" />
          <DataEvidence
            label="Actualización"
            value={new Date().toLocaleDateString("es-AR")}
            context="Refresco al ingresar al panel"
          />
          <DataEvidence
            label="Cobertura"
            value={`${overview.schools.active}/${overview.schools.total}`}
            context="Colegios activos sobre total"
          />
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricTile label="Colegios totales" value={String(overview.schools.total)} />
        <MetricTile label="Activos" value={String(overview.schools.active)} />
        <MetricTile label="Reseñas pendientes" value={String(overview.reviews.pending)} />
        <MetricTile label="Cobertura respuesta reseñas" value={`${overview.reviews.response.responseCoverageRate}%`} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-2">
          <h2 className="text-lg font-semibold text-ink">Top ciudades por colegios</h2>
          <ul className="space-y-1 text-sm text-slate-600">
            {overview.topCities.map((item) => (
              <li key={item.city}>
                • {item.city}: {item.schools} colegios
              </li>
            ))}
          </ul>
        </Card>

        <Card className="space-y-2">
          <h2 className="text-lg font-semibold text-ink">Solicitudes de claim</h2>
          <ul className="space-y-1 text-sm text-slate-600">
            <li>• Pendientes: {overview.claims.byStatus.PENDING}</li>
            <li>• En revisión: {overview.claims.byStatus.UNDER_REVIEW}</li>
            <li>• Aprobadas: {overview.claims.byStatus.APPROVED}</li>
            <li>• Rechazadas: {overview.claims.byStatus.REJECTED}</li>
          </ul>
        </Card>

        <Card className="space-y-2">
          <h2 className="text-lg font-semibold text-ink">Embudo de leads</h2>
          <ul className="space-y-1 text-sm text-slate-600">
            <li>• NEW: {overview.leads.byStatus.NEW}</li>
            <li>• CONTACTED: {overview.leads.byStatus.CONTACTED}</li>
            <li>• QUALIFIED: {overview.leads.byStatus.QUALIFIED}</li>
            <li>• CLOSED: {overview.leads.byStatus.CLOSED}</li>
            <li>• Conversión: {overview.leads.conversionRate}%</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
