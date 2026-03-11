import type { Metadata } from "next";
import { CompareInsightsTracker } from "@/components/analytics/compare-insights-tracker";
import { CompareEmpty } from "@/components/compare/compare-empty";
import { SaveComparisonButton } from "@/components/parent/save-comparison-button";
import { CompareTable } from "@/components/sections/compare-table";
import { SearchResultCard } from "@/components/search/search-result-card";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { getSchoolBySlug, getSchools, type ApiSchoolDetail } from "@/lib/api";
import { buildPageMetadata } from "@/lib/seo";
import { pickParam, type RawSearchParams } from "@/lib/query-params";

export const metadata: Metadata = buildPageMetadata({
  title: "Comparar colegios",
  description: "Comparación lado a lado para decidir con evidencia y prioridades familiares.",
  canonicalPath: "/compare"
});

interface ComparePageProps {
  searchParams?: RawSearchParams;
}

function decodeSafe(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function parseRequestedSlugs(searchParams: RawSearchParams | undefined): string[] {
  const raw = pickParam(searchParams?.schools);
  if (!raw) {
    return [];
  }

  const decoded = decodeSafe(raw);

  return decoded
    .split(",")
    .map((slug) => decodeSafe(slug).trim())
    .filter(Boolean)
    .filter((slug, index, list) => list.indexOf(slug) === index)
    .slice(0, 3);
}

function buildDifferenceInsights(schools: ApiSchoolDetail[]) {
  if (schools.length < 2) {
    return [];
  }

  const insights: string[] = [];
  const validFees = schools.map((school) => school.monthlyFeeEstimate).filter((value): value is number => value !== null);
  if (validFees.length >= 2) {
    const minFee = Math.min(...validFees);
    const maxFee = Math.max(...validFees);
    insights.push(`La diferencia de cuota estimada llega a $${(maxFee - minFee).toLocaleString("es-AR")} por mes.`);
  }

  const validScores = schools.map((school) => school.eduAdvisorScore).filter((value): value is number => value !== null);
  if (validScores.length >= 2) {
    const minScore = Math.min(...validScores);
    const maxScore = Math.max(...validScores);
    insights.push(`Hay una brecha de ${maxScore - minScore} puntos en EduAdvisor Score entre opciones.`);
  }

  const validRatings = schools.map((school) => school.rating.average).filter((value): value is number => value !== null);
  if (validRatings.length >= 2) {
    const minRating = Math.min(...validRatings);
    const maxRating = Math.max(...validRatings);
    insights.push(`La valoración de familias varía ${Math.round((maxRating - minRating) * 10) / 10} puntos.`);
  }

  return insights.slice(0, 3);
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const slugs = parseRequestedSlugs(searchParams);
  const selected = slugs.length
    ? (await Promise.all(slugs.map((slug) => getSchoolBySlug(slug)))).filter((item) => item !== null)
    : [];
  const selectedSlugs = selected.map((school) => school.slug);
  const canAddMore = selectedSlugs.length < 3;
  const suggestionsResponse = await getSchools({ country: "AR", limit: "12", sortBy: "name", sortOrder: "asc" });
  const suggestions = canAddMore
    ? suggestionsResponse.items.filter((school) => !selectedSlugs.includes(school.slug)).slice(0, 6)
    : [];
  const differenceInsights = buildDifferenceInsights(selected);

  function buildSelectionPath(nextSlugs: string[]) {
    if (nextSlugs.length === 0) {
      return "/compare";
    }

    return `/compare?schools=${encodeURIComponent(nextSlugs.join(","))}`;
  }

  return (
    <section className="space-y-6">
      <Card className="space-y-3 bg-gradient-to-r from-brand-50 to-white">
        <SectionHeader
          kicker="Comparador"
          title="Compará colegios en una sola vista"
          description="Elegí hasta tres colegios y comparalos por score, cuota, niveles, reseñas y ubicación."
        />
      </Card>

      <div className="space-y-4">
        {selected.length === 0 ? <CompareEmpty /> : null}

        {selected.length > 0 ? (
          <Card className="space-y-3 border-brand-200">
            <h2 className="text-xl font-semibold text-ink">Colegios seleccionados ({selected.length}/3)</h2>
            <div className="flex flex-wrap gap-2">
              {selected.map((school) => {
                const nextSlugs = selectedSlugs.filter((slug) => slug !== school.slug);
                return (
                  <span
                    key={school.id}
                    className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-sm text-brand-900"
                  >
                    {school.name}
                    <a href={buildSelectionPath(nextSlugs)} className="text-brand-700 hover:text-brand-900">
                      Quitar
                    </a>
                  </span>
                );
              })}
            </div>
            <p className="text-sm text-slate-600">
              Elegí entre 2 y 3 colegios para una comparación más completa.
            </p>
            <div className="flex flex-wrap gap-2">
              {selected.length >= 2 ? <SaveComparisonButton schoolSlugs={selectedSlugs} /> : null}
              {selected.length >= 3 ? (
                <p className="text-sm text-slate-600">Ya llegaste al máximo de 3 colegios.</p>
              ) : null}
            </div>
          </Card>
        ) : null}

        {selected.length >= 2 ? (
          <Card className="space-y-4 border-brand-200 bg-white/95">
            <CompareInsightsTracker schoolSlugs={selectedSlugs} insightsCount={differenceInsights.length} />
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-brand-700">Cabina de decisión</p>
              <h3 className="text-xl font-semibold text-ink">Diferencias clave detectadas automáticamente</h3>
              <ul className="space-y-1 text-sm text-slate-700">
                {differenceInsights.map((insight) => (
                  <li key={insight}>• {insight}</li>
                ))}
              </ul>
            </div>
            <CompareTable schools={selected} />
          </Card>
        ) : null}

        {suggestions.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-ink">
              {selected.length > 0 ? "Sumá otro colegio para comparar" : "Colegios sugeridos para empezar"}
            </h3>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {suggestions.map((school) => {
                const nextSlugs = Array.from(new Set([...selectedSlugs, school.slug])).slice(0, 3);
                return (
                  <div key={school.id}>
                    <SearchResultCard
                      school={school}
                      showSaveButton={false}
                      compareHref={buildSelectionPath(nextSlugs)}
                      compareButtonLabel={selected.length > 0 ? "Agregar" : "Comparar"}
                      variant={selected.length > 0 ? "compact-mobile" : "search"}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
