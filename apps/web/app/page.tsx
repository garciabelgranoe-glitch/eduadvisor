import Link from "next/link";
import { CityLandingLinks } from "@/components/sections/city-landing-links";
import { HeroSearch } from "@/components/sections/hero-search";
import { PremiumSchoolsCarousel } from "@/components/sections/premium-schools-carousel";
import { RankingList } from "@/components/sections/ranking-list";
import { SearchResultCard } from "@/components/search/search-result-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FeatureState } from "@/components/ui/feature-state";
import { SectionHeader } from "@/components/ui/section-header";
import { getRankings, getSchools, getSeoCities } from "@/lib/api";
import { rankingByCity } from "@/lib/mock-data";
import { cityRankingsPath } from "@/lib/seo";

export const revalidate = 120;

const highlights = [
  {
    icon: "🔍",
    title: "Encontrá opciones que sí encajan",
    description: "Filtrá por zona, nivel y presupuesto para ir directo a colegios relevantes para tu familia.",
    ctaLabel: "Buscar colegios",
    href: "/search"
  },
  {
    icon: "⚖️",
    title: "Compará sin perder tiempo",
    description: "Mirá diferencias clave entre colegios en una sola vista. Score, cuota, propuesta y más.",
    ctaLabel: "Ir al comparador",
    href: "/compare"
  },
  {
    icon: "📊",
    title: "Decidí con datos reales",
    description: "Consultá rankings por ciudad para entender qué opciones lideran en tu zona.",
    ctaLabel: "Ver rankings",
    href: "/rankings"
  }
];

export default async function HomePage() {
  const [schools, seoCities, rankings, featuredCandidates] = await Promise.all([
    getSchools({ country: "AR", limit: "6", sortBy: "createdAt", sortOrder: "desc" }),
    getSeoCities({ country: "AR", limit: "6" }),
    getRankings({ country: "AR", limit: "3" }),
    getSchools({
      country: "AR",
      page: "1",
      limit: "50",
      sortBy: "leadIntentScore",
      sortOrder: "desc"
    })
  ]);

  const rankingItems =
    rankings?.items.map((item) => ({
      city: item.city.name,
      topScore: item.topScore ?? 0,
      schools: item.schools,
      path: cityRankingsPath(item.city.provinceSlug, item.city.slug)
    })) ?? rankingByCity;

  const premiumCarouselItems = featuredCandidates.items
    .filter((school) => school.profile.status === "PREMIUM" && school.media?.logoUrl)
    .map((school) => ({
      id: school.id,
      name: school.name,
      slug: school.slug,
      logoUrl: school.media?.logoUrl ?? "",
      city: school.location.city,
      province: school.location.province
    }));

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "EduAdvisor",
    url: "https://eduadvisor.com",
    description: "Plataforma para descubrir, comparar y elegir colegios privados en Latinoamérica"
  };

  return (
    <div className="space-y-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />

      <HeroSearch totalSchools={schools.meta.total} totalCities={seoCities.meta.total} />

      {premiumCarouselItems.length > 0 && (
        <PremiumSchoolsCarousel items={premiumCarouselItems} />
      )}

      {/* How it works */}
      <section>
        <SectionHeader
          kicker="Cómo funciona"
          title="Todo lo que necesitás para elegir bien"
          description="Tres pasos para tomar la decisión más importante para tu hijo."
        />
        <div className="mt-6 grid gap-4 md:auto-rows-fr md:grid-cols-3">
          {highlights.map((item, i) => (
            <Card
              key={item.title}
              className="animate-rise group flex h-full flex-col gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(13,27,31,0.12)]"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-xl">
                  {item.icon}
                </span>
                <span className="mt-2 text-xs font-bold uppercase tracking-widest text-brand-600">
                  Paso {i + 1}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <h2 className="font-display text-xl leading-snug text-ink">{item.title}</h2>
                <p className="flex-1 text-sm leading-relaxed text-slate-600">{item.description}</p>
              </div>
              <Button asChild className="mt-auto w-full" variant="ghost">
                <Link href={item.href as never}>{item.ctaLabel}</Link>
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* Recent schools */}
      <section className="space-y-6">
        <SectionHeader
          kicker="Catálogo"
          title="Últimos colegios incorporados"
          description="Perfiles actualizados con datos reales de cuota, infraestructura y propuesta educativa."
          actions={
            <Button asChild variant="ghost">
              <Link href="/search">Ver todos →</Link>
            </Button>
          }
        />
        {schools.items.length === 0 ? (
          <FeatureState
            title="No pudimos cargar colegios"
            description="Verificá el backend y el índice de búsqueda, luego recargá la página."
            actionLabel="Ir a buscar colegios"
            actionHref="/search"
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {schools.items.map((school) => (
              <SearchResultCard key={school.id} school={school} />
            ))}
          </div>
        )}
      </section>

      {/* Rankings */}
      <section className="space-y-6">
        <SectionHeader
          kicker="Rankings"
          title="Ciudades con mayor performance educativa"
          description="Comparativas por ciudad basadas en score, reviews y actividad de perfiles."
        />
        <RankingList items={rankingItems} />
      </section>

      {/* B2B callout — subtle nudge for schools */}
      <section className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-brand-50 p-8 text-center shadow-[0_8px_24px_rgba(13,27,31,0.06)]">
        <p className="ea-kicker mb-3 text-amber-700">Para colegios</p>
        <h2 className="font-display mb-3 text-3xl text-ink">
          ¿Tu colegio ya está en EduAdvisor?
        </h2>
        <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-slate-600">
          Recibí consultas de familias que ya están buscando. Completá tu perfil y accedé a un
          panel de leads, estadísticas y herramientas para mostrar tu propuesta educativa.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/para-colegios">Publicar mi colegio</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/para-colegios#planes">Ver planes y precios →</Link>
          </Button>
        </div>
      </section>

      <CityLandingLinks cities={seoCities.items} />
    </div>
  );
}
