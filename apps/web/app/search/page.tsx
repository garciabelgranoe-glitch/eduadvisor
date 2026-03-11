import type { Metadata } from "next";
import { GoogleEmbedMap } from "@/components/maps/google-embed-map";
import { SearchAnalyticsTracker } from "@/components/search/search-analytics-tracker";
import { SearchFiltersForm } from "@/components/search/search-filters-form";
import { SearchResultCard } from "@/components/search/search-result-card";
import { Card } from "@/components/ui/card";
import { FeatureState } from "@/components/ui/feature-state";
import { SectionHeader } from "@/components/ui/section-header";
import { searchSchools, type SchoolSearchParams } from "@/lib/api";
import { pickParam, type RawSearchParams } from "@/lib/query-params";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Buscar colegios",
    description: "Resultados por ubicación, nivel, cuota y rating para familias en Argentina.",
    canonicalPath: "/search",
    index: false,
    follow: true
  });
}

interface SearchPageProps {
  searchParams?: RawSearchParams;
}

const SEARCH_SORT_OPTIONS = new Set<NonNullable<SchoolSearchParams["sortBy"]>>([
  "relevance",
  "leadIntentScore",
  "name",
  "monthlyFeeEstimate",
  "createdAt"
]);

const SEARCH_ORDER_OPTIONS = new Set<NonNullable<SchoolSearchParams["sortOrder"]>>(["asc", "desc"]);

function parseSortBy(value: string | null | undefined): NonNullable<SchoolSearchParams["sortBy"]> {
  if (value && SEARCH_SORT_OPTIONS.has(value as NonNullable<SchoolSearchParams["sortBy"]>)) {
    return value as NonNullable<SchoolSearchParams["sortBy"]>;
  }

  return "relevance";
}

function parseSortOrder(value: string | null | undefined): NonNullable<SchoolSearchParams["sortOrder"]> {
  if (value && SEARCH_ORDER_OPTIONS.has(value as NonNullable<SchoolSearchParams["sortOrder"]>)) {
    return value as NonNullable<SchoolSearchParams["sortOrder"]>;
  }

  return "desc";
}

function normalizeParams(searchParams: RawSearchParams | undefined): SchoolSearchParams {
  return {
    q: pickParam(searchParams?.q),
    country: pickParam(searchParams?.country),
    province: pickParam(searchParams?.province),
    city: pickParam(searchParams?.city),
    level: pickParam(searchParams?.level),
    feeMin: pickParam(searchParams?.feeMin),
    feeMax: pickParam(searchParams?.feeMax),
    ratingMin: pickParam(searchParams?.ratingMin),
    page: pickParam(searchParams?.page) ?? "1",
    limit: pickParam(searchParams?.limit) ?? "12",
    sortBy: parseSortBy(pickParam(searchParams?.sortBy)),
    sortOrder: parseSortOrder(pickParam(searchParams?.sortOrder))
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = normalizeParams(searchParams);
  const results = await searchSchools(query);
  const hasLocationFilter = Boolean(query.city?.trim() || query.province?.trim());
  const resolvedMapQuery = hasLocationFilter
    ? [
        query.city,
        query.province,
        query.country ? (query.country.toUpperCase() === "AR" ? "Argentina" : query.country) : "Argentina"
      ]
        .filter((item): item is string => Boolean(item))
        .join(", ")
    : "Argentina";

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <SearchAnalyticsTracker
        query={{
          q: query.q,
          city: query.city,
          level: query.level,
          feeMin: query.feeMin,
          feeMax: query.feeMax,
          ratingMin: query.ratingMin
        }}
        total={results.meta.total}
        engine={results.engine}
      />
      <aside className="space-y-4">
        <SearchFiltersForm current={query} />

        <Card className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-700">Mapa</p>
          <GoogleEmbedMap
            query={resolvedMapQuery}
            title={hasLocationFilter ? `Mapa de resultados para ${resolvedMapQuery}` : "Mapa general de Argentina"}
            heightClassName="h-56"
          />
        </Card>
      </aside>

      <section className="space-y-4">
        <SectionHeader
          kicker="Resultados"
          title={`${results.meta.total} colegios encontrados`}
          description={`Motor de búsqueda: ${results.engine}`}
        />
        <Card className="space-y-2 border-brand-100 bg-white/95">
          <p className="text-xs uppercase tracking-[0.16em] text-brand-700">Confianza y metodología</p>
          <p className="text-sm text-slate-700">
            Los resultados combinan datos institucionales, señales de Google y moderación editorial de EduAdvisor.
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-slate-500">
            <span>Fuente: Google + fichas institucionales</span>
            <span>Actualización: {new Date().toLocaleDateString("es-AR")}</span>
            <span>Ranking: relevancia local + señales de calidad</span>
          </div>
        </Card>

        {results.items.length === 0 ? (
          <FeatureState
            title="No encontramos resultados"
            description="Probá ampliar ciudad, nivel o rango de cuota para descubrir más opciones."
          />
        ) : (
          <div className="grid gap-4">
            {results.items.map((school) => (
              <SearchResultCard key={school.id} school={school} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
