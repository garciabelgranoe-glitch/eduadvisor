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
    title: "Encontrá opciones que sí encajan",
    description: "Filtra por zona, nivel y presupuesto para ir directo a colegios relevantes.",
    ctaLabel: "Buscar colegios",
    href: "/search"
  },
  {
    title: "Compara sin perder tiempo",
    description: "Mira diferencias clave entre colegios en una sola vista.",
    ctaLabel: "Ir al comparador",
    href: "/compare"
  },
  {
    title: "Decidí con datos de cada ciudad",
    description: "Consulta rankings para entender como viene cada zona antes de elegir.",
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
    <div className="space-y-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />

      <HeroSearch totalSchools={schools.meta.total} totalCities={seoCities.meta.total} />
      <PremiumSchoolsCarousel items={premiumCarouselItems} />

      <section className="grid gap-4 md:auto-rows-fr md:grid-cols-3">
        {highlights.map((item) => (
          <Card key={item.title} className="animate-rise flex h-full flex-col gap-3">
            <h2 className="font-display text-2xl text-ink">{item.title}</h2>
            <p className="flex-1 text-sm text-slate-600">{item.description}</p>
            <Button asChild className="mt-auto w-full" variant="ghost">
              <Link href={item.href as never}>{item.ctaLabel}</Link>
            </Button>
          </Card>
        ))}
      </section>

      <section className="space-y-4">
        <SectionHeader
          kicker="Destacados"
          title="Últimos colegios incorporados al catálogo"
          actions={
            <Button asChild variant="ghost">
              <Link href="/search">Ver todos</Link>
            </Button>
          }
        />
        {schools.items.length === 0 ? (
          <FeatureState
            title="No pudimos cargar colegios"
            description="Verificá backend e índice de búsqueda y recargá la página."
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

      <section className="space-y-4">
        <SectionHeader kicker="Rankings" title="Ciudades con mayor performance educativa" />
        <RankingList items={rankingItems} />
      </section>

      <CityLandingLinks cities={seoCities.items} />
    </div>
  );
}
