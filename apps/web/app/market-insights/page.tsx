import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { FormShell } from "@/components/ui/form-shell";
import { MetricTile } from "@/components/ui/metric-tile";
import { Select } from "@/components/ui/select";
import { getMarketInsights, getSeoCities } from "@/lib/api";
import { formatCurrency, formatRating } from "@/lib/format";
import { buildPageMetadata } from "@/lib/seo";
import { pickParam, type RawSearchParams } from "@/lib/query-params";

export const metadata: Metadata = buildPageMetadata({
  title: "Inteligencia de mercado",
  description: "Inteligencia de mercado educativo para colegios y familias.",
  canonicalPath: "/market-insights"
});

interface MarketInsightsPageProps {
  searchParams?: RawSearchParams;
}

export default async function MarketInsightsPage({ searchParams }: MarketInsightsPageProps) {
  const selectedCity = pickParam(searchParams?.city) ?? "";
  const [insights, cities] = await Promise.all([
    getMarketInsights({
      country: "AR",
      city: selectedCity || undefined,
      windowDays: "30",
      topLimit: "5"
    }),
    getSeoCities({ country: "AR", limit: "200" })
  ]);

  const avgFee = insights?.metrics.avgMonthlyFee ?? null;
  const demand = insights?.metrics.demandByLevel ?? { INICIAL: 0, PRIMARIA: 0, SECUNDARIA: 0 };
  const demandByLevelPairs: Array<[string, number]> = [
    ["Inicial", demand.INICIAL],
    ["Primaria", demand.PRIMARIA],
    ["Secundaria", demand.SECUNDARIA]
  ];
  const demandTop = demandByLevelPairs.sort((a, b) => b[1] - a[1])[0];
  const topSearched = insights?.mostSearchedSchools[0]?.schoolName ?? "Sin datos";

  return (
    <section className="space-y-6">
      <Card className="space-y-3 bg-gradient-to-r from-brand-50 to-white">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-700">Inteligencia de mercado educativo</p>
        <h1 className="font-display text-4xl text-ink">Panorama de mercado en tiempo casi real</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Mide demanda por nivel, cuotas promedio y evolución de satisfacción a nivel país o por ciudad.
        </p>
        <FormShell
          title="Filtrar por ciudad"
          description="Cambiá entre vista nacional y vista local para analizar oferta y demanda."
          className="border border-brand-100 bg-white/90"
        >
          <form className="flex flex-wrap items-end gap-3" method="get">
            <FormField label="Ciudad" className="min-w-[240px] flex-1">
              <Select name="city" defaultValue={selectedCity}>
                <option value="">Todas las ciudades (vista nacional)</option>
                {cities.items.map((city) => (
                  <option key={`${city.provinceSlug}-${city.slug}`} value={city.slug}>
                    {city.city} ({city.province})
                  </option>
                ))}
              </Select>
            </FormField>
            <Button type="submit">Aplicar ciudad</Button>
          </form>
        </FormShell>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricTile label="Cuota promedio" value={formatCurrency(avgFee)} />
        <MetricTile label="Demanda principal" value={`${demandTop[0]} (${demandTop[1]})`} />
        <MetricTile
          label="Satisfacción promedio"
          value={insights?.metrics.satisfactionAverage ? `${formatRating(insights.metrics.satisfactionAverage)}/5` : "Sin datos"}
        />
        <MetricTile label="Colegio más buscado" value={topSearched} />
      </div>

      <p className="text-sm text-slate-500">
        Vista actual: {selectedCity ? `ciudad ${insights?.scope.city ?? selectedCity}` : "nacional (todas las ciudades)"}.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-3">
          <h2 className="text-xl font-semibold text-ink">Ciudades con mayor actividad</h2>
          {insights?.topCities.length ? (
            <div className="space-y-2 text-sm text-slate-600">
              {insights.topCities.map((city, index) => (
                <p key={city.citySlug}>
                  #{index + 1} {city.city} · {city.schools} colegios · {city.leadsWindow} leads
                </p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600">No hay datos disponibles.</p>
          )}
        </Card>

        <Card className="space-y-3">
          <h2 className="text-xl font-semibold text-ink">Tendencia de leads (6 meses)</h2>
          {insights?.leadTrend.length ? (
            <div className="space-y-2 text-sm text-slate-600">
              {insights.leadTrend.map((item) => (
                <p key={item.month}>
                  {item.month}: {item.leads}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600">No hay tendencia disponible.</p>
          )}
        </Card>
      </div>
    </section>
  );
}
