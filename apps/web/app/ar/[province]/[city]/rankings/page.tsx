import Link from "next/link";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { Card } from "@/components/ui/card";
import { getRankings } from "@/lib/api";
import { getGeoContext } from "@/lib/seo/geo-data";
import {
  buildPageMetadata,
  buildItemListSchema,
  buildBreadcrumbSchema,
  citySchoolProfilePath,
  citySchoolsCategoryPath,
  cityRankingsPath
} from "@/lib/seo";

export const revalidate = 900;

interface RankingsCityPageProps {
  params: {
    province: string;
    city: string;
  };
}

export async function generateMetadata({ params }: RankingsCityPageProps): Promise<Metadata> {
  const context = await getGeoContext(params.province, params.city);

  if (!context) {
    return buildPageMetadata({
      title: "Ranking no disponible",
      description: "No encontramos ranking para la ciudad solicitada.",
      canonicalPath: "/ar",
      index: false
    });
  }

  return buildPageMetadata({
    title: `Ranking de colegios en ${context.landing.city.name}`,
    description: `Ranking de colegios en ${context.landing.city.name} con metodología transparente de EduAdvisor Score.`,
    canonicalPath: cityRankingsPath(context.landing.city.provinceSlug, context.landing.city.slug)
  });
}

export default async function RankingsCityPage({ params }: RankingsCityPageProps) {
  const context = await getGeoContext(params.province, params.city);

  if (!context) {
    notFound();
  }

  if (!context.isCanonical) {
    permanentRedirect(cityRankingsPath(context.landing.city.provinceSlug, context.landing.city.slug));
  }

  const rankings = await getRankings({
    country: "AR",
    province: context.landing.city.provinceSlug,
    city: context.landing.city.slug,
    limit: "12"
  });
  const fallbackRankings =
    !rankings || rankings.items.length === 0
      ? await getRankings({
          country: "AR",
          province: context.landing.city.province,
          city: context.landing.city.name,
          limit: "12"
        })
      : null;

  const rankingItems = rankings?.items.length ? rankings.items : (fallbackRankings?.items ?? []);
  const rankingByCity =
    rankingItems.find((item) => item.city.slug === context.landing.city.slug) ??
    rankingItems.find((item) => item.city.name.toLowerCase() === context.landing.city.name.toLowerCase()) ??
    rankingItems[0] ??
    null;
  const schoolRanking = rankingByCity?.topSchools ?? [];

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Inicio", path: "/" },
    { name: "Argentina", path: "/ar" },
    { name: context.landing.city.province, path: `/ar/${context.landing.city.provinceSlug}` },
    { name: context.landing.city.name, path: `/ar/${context.landing.city.provinceSlug}/${context.landing.city.slug}` },
    { name: "Rankings", path: cityRankingsPath(context.landing.city.provinceSlug, context.landing.city.slug) }
  ]);

  const itemListSchema = buildItemListSchema({
    name: `Ranking de colegios en ${context.landing.city.name}`,
    description: `Ranking principal por ciudad en ${context.landing.city.name}`,
    path: cityRankingsPath(context.landing.city.provinceSlug, context.landing.city.slug),
    itemUrls: schoolRanking.map((school) =>
      citySchoolProfilePath(context.landing.city.provinceSlug, context.landing.city.slug, school.slug)
    )
  });

  return (
    <section className="space-y-5">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={itemListSchema} />

      <Card className="space-y-2 bg-gradient-to-r from-brand-50 to-white">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-700">EduAdvisor Score</p>
        <h1 className="font-display text-4xl text-ink">Ranking en {context.landing.city.name}</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Metodología: combinamos satisfacción familiar, consistencia de ratings, tracción de leads calificados y
          completitud de perfil institucional, sumando la calidad de respuesta del colegio a las reseñas aprobadas.
        </p>
      </Card>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Link
          href={
            citySchoolsCategoryPath(context.landing.city.provinceSlug, context.landing.city.slug, "bilingues") as never
          }
        >
          <Card className="text-sm text-slate-600">Ranking categoría bilingües</Card>
        </Link>
        <Link
          href={
            citySchoolsCategoryPath(context.landing.city.provinceSlug, context.landing.city.slug, "deportes") as never
          }
        >
          <Card className="text-sm text-slate-600">Ranking categoría deportes</Card>
        </Link>
        <Link
          href={
            citySchoolsCategoryPath(
              context.landing.city.provinceSlug,
              context.landing.city.slug,
              "jornada-completa"
            ) as never
          }
        >
          <Card className="text-sm text-slate-600">Ranking jornada completa</Card>
        </Link>
        <Link
          href={
            citySchoolsCategoryPath(context.landing.city.provinceSlug, context.landing.city.slug, "tecnologicos") as never
          }
        >
          <Card className="text-sm text-slate-600">Ranking tecnológicos</Card>
        </Link>
      </div>

      {schoolRanking.length === 0 ? (
        <Card className="text-sm text-slate-600">
          No hay datos de ranking disponibles todavía para esta zona. Volvé a intentar en unos minutos.
        </Card>
      ) : (
        <div className="grid gap-3">
          {schoolRanking.map((school, index) => (
            <Card
              key={school.id}
              id={`item-${index + 1}`}
              className="flex flex-wrap items-center justify-between gap-3 border-brand-200"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Puesto #{index + 1}</p>
                <h3 className="text-xl font-semibold text-ink">{school.name}</h3>
                <p className="text-sm text-slate-600">
                  Reseñas aprobadas: {school.approvedReviewCount} · Cobertura de respuesta:{" "}
                  {school.responseCoverageRate.toFixed(1)}%
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-brand-900 px-3 py-2 text-right text-white">
                  <p className="text-[10px] uppercase tracking-[0.14em]">Score</p>
                  <p className="text-lg font-semibold">{school.score ?? "-"}</p>
                </div>
                <Link href={citySchoolProfilePath(context.landing.city.provinceSlug, context.landing.city.slug, school.slug) as never}>
                  <span className="text-sm font-semibold text-brand-700">Ver perfil →</span>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
