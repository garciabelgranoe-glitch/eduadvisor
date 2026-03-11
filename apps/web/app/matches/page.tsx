import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { FormShell } from "@/components/ui/form-shell";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DataEvidence } from "@/components/ui/data-evidence";
import { getMatchRecommendations, type MatchRecommendationParams } from "@/lib/api";
import { formatCurrency, formatRating } from "@/lib/format";
import { pickParam, type RawSearchParams } from "@/lib/query-params";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Recomendaciones IA",
  description: "Matching entre preferencias familiares y colegios recomendados.",
  canonicalPath: "/matches"
});

interface MatchesPageProps {
  searchParams?: RawSearchParams;
}

function normalizeParams(searchParams: RawSearchParams | undefined): MatchRecommendationParams {
  return {
    country: pickParam(searchParams?.country),
    province: pickParam(searchParams?.province),
    city: pickParam(searchParams?.city),
    childAge: pickParam(searchParams?.childAge),
    educationLevel: pickParam(searchParams?.educationLevel) as MatchRecommendationParams["educationLevel"] | undefined,
    budgetMin: pickParam(searchParams?.budgetMin),
    budgetMax: pickParam(searchParams?.budgetMax),
    maxDistanceKm: pickParam(searchParams?.maxDistanceKm),
    preferredTypes: pickParam(searchParams?.preferredTypes),
    priorities: pickParam(searchParams?.priorities),
    queryText: pickParam(searchParams?.queryText),
    limit: pickParam(searchParams?.limit) ?? "8"
  };
}

function hasActiveFilters(query: MatchRecommendationParams) {
  return Object.entries(query).some(([key, value]) => key !== "limit" && value !== undefined && value !== "");
}

const placeholderPriorities = [
  "Ingles fuerte",
  "Jornada completa",
  "Distancia <= 6 km",
  "Presupuesto medio"
];

export default async function MatchesPage({ searchParams }: MatchesPageProps) {
  const query = normalizeParams(searchParams);
  const hasFilters = hasActiveFilters(query);
  const response = hasFilters ? await getMatchRecommendations(query) : null;

  return (
    <section className="space-y-6">
      <Card className="space-y-3 bg-gradient-to-r from-amber-50 to-white">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-700">Matching inteligente</p>
        <h1 className="font-display text-4xl text-ink">Mejores coincidencias para tu hijo</h1>
        <div className="flex flex-wrap gap-2">
          {(response?.criteria.priorities.length ? response.criteria.priorities : placeholderPriorities).map((priority) => (
            <Badge key={priority}>{priority}</Badge>
          ))}
        </div>
      </Card>

      <FormShell title="Contanos qué colegio estás buscando" description="Completá tus prioridades y generá recomendaciones personalizadas.">
        <form action="/matches" method="get" className="grid gap-3 md:grid-cols-2">
          <FormField label="Ciudad">
            <Input name="city" placeholder="Ciudad" defaultValue={query.city} />
          </FormField>
          <FormField label="Provincia">
            <Input name="province" placeholder="Provincia" defaultValue={query.province} />
          </FormField>
          <FormField label="País">
            <Input name="country" placeholder="País (ej: AR)" defaultValue={query.country} />
          </FormField>
          <FormField label="Edad del niño o niña">
            <Input name="childAge" type="number" min={2} max={18} placeholder="Edad" defaultValue={query.childAge} />
          </FormField>
          <FormField label="Nivel educativo">
            <Select id="educationLevel" name="educationLevel" defaultValue={query.educationLevel ?? "PRIMARIA"}>
              <option value="INICIAL">Inicial</option>
              <option value="PRIMARIA">Primaria</option>
              <option value="SECUNDARIA">Secundaria</option>
            </Select>
          </FormField>
          <FormField label="Distancia máxima">
            <Input
              name="maxDistanceKm"
              type="number"
              min={1}
              max={80}
              placeholder="Distancia máxima (km)"
              defaultValue={query.maxDistanceKm}
            />
          </FormField>
          <FormField label="Presupuesto mínimo">
            <Input name="budgetMin" type="number" min={0} placeholder="Presupuesto mínimo" defaultValue={query.budgetMin} />
          </FormField>
          <FormField label="Presupuesto máximo">
            <Input name="budgetMax" type="number" min={0} placeholder="Presupuesto máximo" defaultValue={query.budgetMax} />
          </FormField>
          <FormField label="Tipos preferidos" hint="Ejemplo: BILINGUAL,INTERNATIONAL,SPORTS">
            <Input name="preferredTypes" placeholder="Tipos" defaultValue={query.preferredTypes} />
          </FormField>
          <FormField label="Prioridades" hint="Ejemplo: Inglés fuerte, Jornada completa">
            <Input name="priorities" placeholder="Prioridades" defaultValue={query.priorities} />
          </FormField>
          <FormField label="Descripción libre">
            <Input
              name="queryText"
              placeholder='Ejemplo: "Busco colegio con buen inglés y jornada completa"'
              defaultValue={query.queryText}
            />
          </FormField>
          <FormField label="Cantidad de resultados">
            <Input name="limit" type="number" min={1} max={20} defaultValue={query.limit ?? "8"} />
          </FormField>
          <div className="md:col-span-2">
            <Button type="submit" className="w-full md:w-auto">
              Generar recomendaciones
            </Button>
          </div>
        </form>
      </FormShell>

      {!hasFilters ? (
        <Card className="text-sm text-slate-600">
          Completá el cuestionario para calcular compatibilidad colegio-familia y ver tus top matches personalizados.
        </Card>
      ) : response === null ? (
        <Card className="text-sm text-slate-600">
          No pudimos calcular recomendaciones con esos criterios. Revisá los datos ingresados e intentá nuevamente.
        </Card>
      ) : response.items.length === 0 ? (
        <Card className="text-sm text-slate-600">
          No encontramos coincidencias para esos filtros. Probá ampliar distancia, presupuesto o nivel educativo.
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-brand-100 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-brand-700">Resultado del algoritmo</p>
            <p className="text-sm text-slate-600">
              Analizados: {response.meta.totalConsidered} colegios · Coincidencias destacadas: {response.meta.totalMatched}
            </p>
          </div>
          <div className="grid gap-4">
            {response.items.map((item) => (
              <Card key={item.school.id} className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-brand-700">Match #{item.rank}</p>
                    <h3 className="font-display text-2xl text-ink">{item.school.name}</h3>
                    <p className="text-sm text-slate-600">
                      {item.school.location.city}, {item.school.location.province}
                    </p>
                  </div>
                  <div className="rounded-xl bg-brand-900 px-4 py-2 text-white">
                    <p className="text-xs uppercase tracking-[0.14em]">Compatibilidad</p>
                    <p className="text-2xl font-semibold">{item.score}</p>
                  </div>
                </div>

                <div className="grid gap-2 rounded-xl bg-paper p-3 text-sm md:grid-cols-4">
                  <DataEvidence
                    label="Cuota"
                    value={formatCurrency(item.school.monthlyFeeEstimate)}
                    context="Estimación mensual"
                  />
                  <DataEvidence
                    label="Rating"
                    value={formatRating(item.school.rating.average)}
                    context={`${item.school.rating.count} reseñas`}
                  />
                  <DataEvidence
                    label="Distancia"
                    value={item.distanceKm !== null ? `${item.distanceKm} km` : "No calculada"}
                    context="Desde tu zona elegida"
                  />
                  <DataEvidence
                    label="Score EduAdvisor"
                    value={item.school.eduAdvisorScore ?? "-"}
                    context="Calidad global"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {item.highlights.map((highlight) => (
                    <Badge key={highlight}>{highlight}</Badge>
                  ))}
                </div>

                <div className="space-y-2 rounded-xl border border-brand-100 bg-white p-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-brand-700">Por qué aparece este colegio</p>
                  <div className="space-y-2">
                    {[
                      { label: "Distancia", value: item.breakdown.distance },
                      { label: "Presupuesto", value: item.breakdown.budget },
                      { label: "Nivel", value: item.breakdown.level },
                      { label: "Calidad", value: item.breakdown.quality },
                      { label: "Intención", value: item.breakdown.intent }
                    ].map((entry) => (
                      <div key={entry.label} className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-slate-600">
                          <span>{entry.label}</span>
                          <span className="font-semibold text-ink">{entry.value}</span>
                        </div>
                        <div className="h-2 rounded-full bg-brand-50">
                          <div
                            className="h-full rounded-full bg-brand-600 transition-all duration-500"
                            style={{ width: `${Math.max(4, Math.min(100, entry.value))}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
