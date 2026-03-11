import Link from "next/link";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { GoogleEmbedMap } from "@/components/maps/google-embed-map";
import { SearchResultCard } from "@/components/search/search-result-card";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import {
  buildFaqSchema,
  buildGeoFaq,
  buildGeoIntro,
  buildItemListSchema,
  cityPath,
  citySchoolsPath,
  citySchoolsCategoryPath,
  evaluateGeoIndexability,
  geoChecklist,
  shouldNoindexPagination
} from "@/lib/seo";
import { buildPageMetadata, buildBreadcrumbSchema, cityRankingsPath } from "@/lib/seo";
import { getGeoContext, getGeoSchools } from "@/lib/seo/geo-data";

export const revalidate = 900;

interface CitySchoolsPageProps {
  params: {
    province: string;
    city: string;
  };
  searchParams?: {
    page?: string;
  };
}

export async function generateStaticParams() {
  return [];
}

async function resolvePageData(params: CitySchoolsPageProps["params"]) {
  const context = await getGeoContext(params.province, params.city);

  if (!context) {
    return null;
  }

  const schools = await getGeoSchools(context.landing.city.slug, "24");
  const faq = buildGeoFaq({ city: context.landing.city.name, province: context.landing.city.province });
  const guardrail = evaluateGeoIndexability({
    schoolCount: context.landing.stats.schoolCount,
    faqCount: faq.length,
    topPicksCount: Math.min(schools.items.length, 6),
    hasUniqueIntro: true
  });

  return { context, schools, faq, guardrail };
}

export async function generateMetadata({ params, searchParams }: CitySchoolsPageProps): Promise<Metadata> {
  const resolved = await resolvePageData(params);

  if (!resolved) {
    return buildPageMetadata({
      title: "Listado no disponible",
      description: "El listado solicitado no existe.",
      canonicalPath: "/ar",
      index: false
    });
  }

  const page = Number(searchParams?.page ?? "1");
  const isPaginated = shouldNoindexPagination(page);
  const hasUnknownFacetParams = Object.entries(searchParams ?? {}).some(
    ([key, value]) => key !== "page" && value !== undefined && value !== ""
  );
  const shouldIndex = resolved.guardrail.indexable && !isPaginated && !hasUnknownFacetParams;

  return buildPageMetadata({
    title: `Colegios privados en ${resolved.context.landing.city.name}`,
    description: `Compará colegios en ${resolved.context.landing.city.name}, ${resolved.context.landing.city.province}, con destacados, FAQ local y datos de mercado.`,
    canonicalPath: citySchoolsPath(
      resolved.context.landing.city.provinceSlug,
      resolved.context.landing.city.slug
    ),
    index: shouldIndex,
    follow: true
  });
}

export default async function CitySchoolsPage({ params, searchParams }: CitySchoolsPageProps) {
  const resolved = await resolvePageData(params);

  if (!resolved) {
    notFound();
  }

  const { context, schools, faq, guardrail } = resolved;

  if (!context.isCanonical) {
    permanentRedirect(citySchoolsPath(context.landing.city.provinceSlug, context.landing.city.slug));
  }

  const page = Number(searchParams?.page ?? "1");
  const pageSize = 12;
  const currentPage = Number.isFinite(page) && page > 0 ? page : 1;
  const totalPages = Math.max(1, Math.ceil(schools.items.length / pageSize));
  const start = (currentPage - 1) * pageSize;
  const pagedItems = schools.items.slice(start, start + pageSize);

  if (pagedItems.length === 0 && currentPage > 1) {
    notFound();
  }

  const intro = buildGeoIntro({
    city: context.landing.city.name,
    province: context.landing.city.province,
    schoolCount: context.landing.stats.schoolCount,
    averageMonthlyFee: context.landing.stats.averageMonthlyFee
  });

  const topPicks = schools.items.slice(0, 6).map((school, index) => ({
    school,
    reason:
      index % 2 === 0
        ? "Destaca por consistencia en rating y señal de interés de familias."
        : "Sobresale por propuesta educativa visible y perfil institucional completo."
  }));

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Inicio", path: "/" },
    { name: "Argentina", path: "/ar" },
    { name: context.landing.city.province, path: `/ar/${context.landing.city.provinceSlug}` },
    { name: context.landing.city.name, path: cityPath(context.landing.city.provinceSlug, context.landing.city.slug) },
    { name: "Colegios", path: citySchoolsPath(context.landing.city.provinceSlug, context.landing.city.slug) }
  ]);

  const listSchema = buildItemListSchema({
    name: `Colegios privados en ${context.landing.city.name}`,
    description: `Listado principal de colegios privados en ${context.landing.city.name}`,
    path: citySchoolsPath(context.landing.city.provinceSlug, context.landing.city.slug),
    itemUrls: pagedItems.map((item) =>
      `/ar/${context.landing.city.provinceSlug}/${context.landing.city.slug}/colegios/${item.slug}`
    )
  });

  const faqSchema = buildFaqSchema(faq);

  return (
    <section className="space-y-6">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={listSchema} />
      <JsonLd data={faqSchema} />

      <Card className="space-y-4 bg-gradient-to-r from-brand-50 via-white to-amber-50">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-700">Listado principal</p>
        <h1 className="font-display text-4xl text-ink">Colegios privados en {context.landing.city.name}</h1>
        <div className="space-y-3 text-sm text-slate-600">
          {intro.split("\n\n").map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <div className="grid gap-3 rounded-2xl bg-white/90 p-4 md:grid-cols-4">
          <p className="text-sm">
            Colegios activos <span className="block text-xl font-semibold">{context.landing.stats.schoolCount}</span>
          </p>
          <p className="text-sm">
            Cuota promedio{" "}
            <span className="block text-xl font-semibold">
              {formatCurrency(context.landing.stats.averageMonthlyFee)}
            </span>
          </p>
          <p className="text-sm">
            Cuota mínima{" "}
            <span className="block text-xl font-semibold">
              {formatCurrency(context.landing.stats.monthlyFeeRange.min)}
            </span>
          </p>
          <p className="text-sm">
            Cuota máxima{" "}
            <span className="block text-xl font-semibold">
              {formatCurrency(context.landing.stats.monthlyFeeRange.max)}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="ghost">
            <Link href={cityRankingsPath(context.landing.city.provinceSlug, context.landing.city.slug) as never}>
              Ver rankings de ciudad
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link
              href={
                citySchoolsCategoryPath(
                  context.landing.city.provinceSlug,
                  context.landing.city.slug,
                  "jornada-completa"
                ) as never
              }
            >
              Ver categoría jornada completa
            </Link>
          </Button>
        </div>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-xl font-semibold text-ink">Top picks en {context.landing.city.name}</h2>
        {topPicks.length === 0 ? (
          <p className="text-sm text-slate-600">No hay destacados disponibles por el momento.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {topPicks.map((entry) => (
              <article key={entry.school.id} className="rounded-xl border border-brand-100 p-3">
                <h3 className="font-semibold text-ink">{entry.school.name}</h3>
                <p className="text-xs text-slate-500">{entry.school.location.city}</p>
                <p className="mt-2 text-sm text-slate-600">{entry.reason}</p>
              </article>
            ))}
          </div>
        )}
      </Card>

      <Card className="space-y-3">
        <h2 className="text-xl font-semibold text-ink">Mapa + lista</h2>
        <GoogleEmbedMap
          query={`colegios privados en ${context.landing.city.name}, ${context.landing.city.province}, Argentina`}
          title={`Mapa de colegios en ${context.landing.city.name}`}
          heightClassName="h-72"
        />
      </Card>

      <Card className="space-y-3">
        <h2 className="text-xl font-semibold text-ink">Cómo elegir colegio en esta zona</h2>
        <ul className="space-y-1 text-sm text-slate-600">
          {geoChecklist.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-xl font-semibold text-ink">FAQ local</h2>
        <div className="space-y-3">
          {faq.map((item) => (
            <article key={item.question} className="rounded-xl border border-brand-100 p-3">
              <h3 className="font-medium text-ink">{item.question}</h3>
              <p className="mt-1 text-sm text-slate-600">{item.answer}</p>
            </article>
          ))}
        </div>
      </Card>

      {!guardrail.indexable ? (
        <Card className="text-sm text-slate-600">
          Esta página está en modo maduración SEO ({guardrail.reasons.join(", ")}) y permanece noindex hasta alcanzar
          umbral de calidad.
        </Card>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand-700">Colegios</p>
            <h2 className="font-display text-3xl text-ink">Resultados en {context.landing.city.name}</h2>
          </div>
        </div>

        {pagedItems.length === 0 ? (
          <Card className="text-sm text-slate-600">No hay resultados para esta página.</Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {pagedItems.map((school) => (
              <SearchResultCard key={school.id} school={school} variant="ranking" />
            ))}
          </div>
        )}

        <nav aria-label="Paginación de colegios" className="flex items-center gap-2">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => {
            const href =
              pageNumber === 1
                ? citySchoolsPath(context.landing.city.provinceSlug, context.landing.city.slug)
                : `${citySchoolsPath(context.landing.city.provinceSlug, context.landing.city.slug)}?page=${pageNumber}`;

            return (
              <Link
                key={pageNumber}
                href={href as never}
                className={`rounded-lg border px-3 py-1 text-sm ${
                  pageNumber === currentPage
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-brand-100 text-slate-600"
                }`}
              >
                {pageNumber}
              </Link>
            );
          })}
        </nav>
      </section>
    </section>
  );
}
