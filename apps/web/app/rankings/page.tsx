import type { Metadata } from "next";
import { RankingList } from "@/components/sections/ranking-list";
import { Card } from "@/components/ui/card";
import { getRankings } from "@/lib/api";
import { buildPageMetadata, cityRankingsPath } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Rankings de colegios",
  description: "Ranking por ciudad con metodología EduAdvisor Score y transparencia de datos.",
  canonicalPath: "/rankings"
});

export default async function RankingsPage() {
  const rankings = await getRankings({ country: "AR", limit: "12" });
  const items =
    rankings?.items.map((item) => ({
      city: item.city.name,
      topScore: item.topScore ?? 0,
      schools: item.schools,
      path: cityRankingsPath(item.city.provinceSlug, item.city.slug)
    })) ?? [];

  return (
    <section className="space-y-5">
      <Card className="space-y-2 bg-gradient-to-r from-brand-50 to-white">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-700">EduAdvisor Score</p>
        <h1 className="font-display text-4xl text-ink">Ranking por ciudad</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Combinamos satisfacción familiar, consistencia de ratings, engagement, calidad institucional y capacidad de
          respuesta del colegio a reseñas.
        </p>
      </Card>

      {items.length === 0 ? (
        <Card className="text-sm text-slate-600">
          No hay datos de ranking disponibles todavía para esta zona. Volvé a intentar en unos minutos.
        </Card>
      ) : (
        <RankingList items={items} />
      )}
    </section>
  );
}
