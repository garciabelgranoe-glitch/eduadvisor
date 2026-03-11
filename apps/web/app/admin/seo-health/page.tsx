import { Card } from "@/components/ui/card";
import { MetricTile } from "@/components/ui/metric-tile";
import { getSeoHealthSnapshot } from "@/lib/seo/health";

export const dynamic = "force-dynamic";

export default async function AdminSeoHealthPage() {
  const snapshot = await getSeoHealthSnapshot();

  return (
    <section className="space-y-6">
      <Card className="space-y-2 bg-gradient-to-r from-brand-50 to-white">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-700">Panel de salud SEO</p>
        <h2 className="font-display text-3xl text-ink">Cobertura e higiene técnica</h2>
        <p className="text-sm text-slate-600">Actualizado: {new Date(snapshot.generatedAt).toLocaleString("es-AR")}</p>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricTile label="Ciudades SEO" value={String(snapshot.geoPages.totalCities)} />
        <MetricTile label="Ciudades indexables" value={String(snapshot.geoPages.indexableCities)} />
        <MetricTile label="Bloqueadas por guardrail" value={String(snapshot.geoPages.blockedByGuardrail)} />
        <MetricTile label="Escuelas huérfanas" value={String(snapshot.schools.orphanByCity)} />
      </div>

      <Card className="space-y-2">
        <h3 className="text-lg font-semibold text-ink">Checks automáticos</h3>
        <ul className="space-y-1 text-sm text-slate-600">
          <li>• Colisiones de intención ciudad/provincia: {snapshot.duplicates.cityIntentCollisions}</li>
          <li>• Cobertura de colegios en taxonomía geo: {snapshot.schools.total - snapshot.schools.orphanByCity}/{snapshot.schools.total}</li>
          <li>
            • Ratio de indexabilidad geo: {snapshot.geoPages.totalCities === 0 ? 0 : Math.round((snapshot.geoPages.indexableCities / snapshot.geoPages.totalCities) * 100)}%
          </li>
        </ul>
      </Card>
    </section>
  );
}
