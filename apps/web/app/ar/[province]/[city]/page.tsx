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
        <p className="text-xs uppercase tracking-[0.2em] text-brand-700">Landing ciudad</p>
        <h1 className="font-display text-4xl text-ink">Colegios privados en {context.landing.city.name}</h1>
        <p className="max-w-3xl text-sm text-slate-600">
          Accedé al listado principal, rankings y perfiles de colegios de {context.landing.city.name}. Esta landing
          consolida la intención geográfica para evitar duplicación por variaciones de términos.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Link href={citySchoolsPath(context.landing.city.provinceSlug, context.landing.city.slug) as never}>
          <Card className="h-full space-y-2 transition hover:border-brand-300">
            <h2 className="text-2xl font-semibold text-ink">Listado de colegios</h2>
            <p className="text-sm text-slate-600">Explorá colegios, destacados, FAQ local y checklist de decisión.</p>
          </Card>
        </Link>

        <Link href={cityRankingsPath(context.landing.city.provinceSlug, context.landing.city.slug) as never}>
          <Card className="h-full space-y-2 transition hover:border-brand-300">
            <h2 className="text-2xl font-semibold text-ink">Rankings por ciudad</h2>
            <p className="text-sm text-slate-600">Revisá metodología EduAdvisor Score y ranking local transparente.</p>
          </Card>
        </Link>
      </div>

      <Card className="space-y-2">
        <h2 className="text-xl font-semibold text-ink">Colegios destacados en esta ciudad</h2>
        {schools.items.length === 0 ? (
          <p className="text-sm text-slate-600">No hay colegios disponibles por el momento.</p>
        ) : (
          <ul className="space-y-1 text-sm text-slate-600">
            {schools.items.map((school) => (
              <li key={school.id}>• {school.name}</li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  );
}
