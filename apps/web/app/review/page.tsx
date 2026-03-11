import type { Metadata } from "next";
import { ReviewForm } from "@/components/sections/review-form";
import { Card } from "@/components/ui/card";
import { getSchools } from "@/lib/api";
import { pickParam, type RawSearchParams } from "@/lib/query-params";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Escribir reseña",
  description: "Formulario de opinión verificada para familias de EDUADVISOR.",
  canonicalPath: "/review"
});

interface ReviewPageProps {
  searchParams?: RawSearchParams;
}

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  const schoolSlug = pickParam(searchParams?.school);
  const schoolsResponse = await getSchools({ limit: "50", sortBy: "name", sortOrder: "asc" });

  const schools = schoolsResponse.items.map((school) => ({
    id: school.id,
    slug: school.slug,
    name: school.name,
    city: school.location.city
  }));

  return (
    <section className="space-y-5">
      <ReviewForm schools={schools} initialSchoolSlug={schoolSlug} />
      <Card className="space-y-2">
        <h3 className="text-lg font-semibold text-ink">Guía de calidad de reseñas</h3>
        <ul className="space-y-1 text-sm text-slate-600">
          <li>• Describe hechos concretos de tu experiencia.</li>
          <li>• Evita datos personales de menores.</li>
          <li>• Comparte fortalezas y oportunidades de mejora.</li>
        </ul>
      </Card>
    </section>
  );
}
