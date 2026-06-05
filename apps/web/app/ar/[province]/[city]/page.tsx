import Link from "next/link";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { JsonLd } from "@/components/seo/json-ld";
import { buildGeoFaq } from "@/lib/seo/content";
import { getGeoContext, getGeoSchools } from "@/lib/seo/geo-data";
import {
  buildPageMetadata,
  buildBreadcrumbSchema,
  cityPath,
  cityRankingsPath,
  citySchoolProfilePath,
  citySchoolsPath,
  evaluateGeoIndexability
} from "@/lib/seo";

export const revalidate = 900;

interface CityPageProps {
  params: {
    province: string;
    city: string;
  };
}

async function resolveMetadata(params: CityPageProps["params"]) {
  const context = await getGeoContext(params.province, params.city);

  if (!context) {
    return null;
  }

  const faq = buildGeoFaq({ city: context.landing.city.name, province: context.landing.city.province });
  const guardrail = evaluateGeoIndexability({
    schoolCount: context.landing.stats.schoolCount,
    faqCount: faq.length,
    topPicksCount: Math.min(context.landing.stats.schoolCount, 6),
    hasUniqueIntro: true
  });

  return {
    context,
    guardrail
  };
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const result = await resolveMetadata(params);

  if (!result) {
    return buildPageMetadata({
      title: "Ciudad no encontrada",
      description: "La ciudad solicitada no está disponible.",
      canonicalPath: "/ar",
      index: false
    });
  }

  const { context, guardrail } = result;

  return buildPageMetadata({
    title: `Colegios privados en ${context.landing.city.name}`,
    description: `Explorá la oferta educativa de ${context.landing.city.name}, ${context.landing.city.province}, con listados y rankings locales.`,
    canonicalPath: cityPath(context.landing.city.provinceSlug, context.landing.city.slug),
    index: guardrail.indexable,
    follow: true
  });
}

export default async function CityPage({ params }: CityPageProps) {
  const result = await resolveMetadata(params);

  if (!result) {
    notFound();
  }

  const { context } = result;

  if (!context.isCanonical) {
    permanentRedirect(context.canonicalPath);
  }

  const schools = await getGeoSchools(context.landing.city.slug, "6");

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Inicio", path: "/" },
    { name: "Argentina", path: "/ar" },
    { name: context.landing.city.province, path: `/ar/${context.landing.city.provinceSlug}` },
    {
      name: context.landing.city.name,
      path: cityPath(context.landing.city.provinceSlug, context.landing.city.slug)
    }
  ]);

  return (
    <section className="space-y-6">
      <JsonLd data={breadcrumbSchema} />

      <Card className="space-y-3 bg-gradient-to-r from-brand-50 to-white">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-700">{context.landing.city.province}</p>
        <h1 className="font-display text-4xl text-ink">Colegios privados en {context.landing.city.name}</h1>
        <p className="max-w-3xl text-sm text-slate-600">
          Encontrá, comparás y elegís el mejor colegio privado en {context.landing.city.name}. Listados actualizados, rankings locales y perfiles con datos reales de cuota, niveles y reseñas.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Link href={citySchoolsPath(context.landing.city.provinceSlug, context.landing.city.slug) as never}>
          <Card className="group h-full space-y-2 transition hover:border-brand-300 hover:shadow-md">
            <h2 className="text-2xl font-semibold text-ink">Listado de colegios</h2>
            <p className="text-sm text-slate-600">Explorá colegios, destacados, FAQ local y checklist de decisión.</p>
            <p className="pt-1 text-sm font-semibold text-brand-700 group-hover:text-brand-800">
              Ver colegios en {context.landing.city.name} →
            </p>
          </Card>
        </Link>

        <Link href={cityRankingsPath(context.landing.city.provinceSlug, context.landing.city.slug) as never}>
          <Card className="group h-full space-y-2 transition hover:border-brand-300 hover:shadow-md">
            <h2 className="text-2xl font-semibold text-ink">Rankings por ciudad</h2>
            <p className="text-sm text-slate-600">Revisá metodología Radar Score y ranking local transparente.</p>
            <p className="pt-1 text-sm font-semibold text-brand-700 group-hover:text-brand-800">
              Ver ranking de {context.landing.city.name} →
            </p>
          </Card>
        </Link>
      </div>

      {schools.items.length > 0 && (
        <Card className="space-y-3">
          <h2 className="text-xl font-semibold text-ink">Colegios en {context.landing.city.name}</h2>
          <ul className="space-y-2">
            {schools.items.map((school) => (
              <li key={school.id}>
                <Link
                  href={citySchoolProfilePath(school.location.province, school.location.city, school.slug) as never}
                  className="flex items-center justify-between rounded-lg border border-brand-100 bg-brand-50/30 px-4 py-3 text-sm font-medium text-ink transition hover:border-brand-300 hover:bg-brand-50"
                >
                  <span>{school.name}</span>
                  <span className="text-brand-600">→</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={citySchoolsPath(context.landing.city.provinceSlug, context.landing.city.slug) as never}
            className="block pt-1 text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            Ver todos los colegios →
          </Link>
        </Card>
      )}
    </section>
  );
}
