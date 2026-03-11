import Link from "next/link";
import { Card } from "@/components/ui/card";
import { JsonLd } from "@/components/seo/json-ld";
import { getSeoCities } from "@/lib/api";
import { buildPageMetadata, buildBreadcrumbSchema, provincePath } from "@/lib/seo";

export const revalidate = 3600;

export const metadata = buildPageMetadata({
  title: "Colegios privados en Argentina",
  description:
    "Explorá provincias, ciudades y listados de colegios privados en Argentina con datos comparables y contexto local.",
  canonicalPath: "/ar"
});

export default async function ArgentinaHomePage() {
  const seoCities = await getSeoCities({ country: "AR", limit: "5000" });

  const provinceMap = new Map<string, { slug: string; cities: number; schools: number }>();

  for (const city of seoCities.items) {
    const current = provinceMap.get(city.province);
    if (current) {
      current.cities += 1;
      current.schools += city.schoolCount;
      continue;
    }

    provinceMap.set(city.province, {
      slug: city.provinceSlug,
      cities: 1,
      schools: city.schoolCount
    });
  }

  const provinces = Array.from(provinceMap.entries()).sort((a, b) => b[1].schools - a[1].schools);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Inicio", path: "/" },
    { name: "Argentina", path: "/ar" }
  ]);

  return (
    <section className="space-y-6">
      <JsonLd data={breadcrumbSchema} />

      <Card className="space-y-3 bg-gradient-to-r from-brand-50 to-white">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-700">Mapa SEO Argentina</p>
        <h1 className="font-display text-4xl text-ink">Colegios privados por provincia y ciudad</h1>
        <p className="max-w-3xl text-sm text-slate-600">
          Esta es la entrada principal para búsquedas geográficas. Desde acá podés navegar a landings provinciales,
          ciudades y listados canónicos sin depender de filtros indexables.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {provinces.map(([provinceName, summary]) => (
          <Link key={provinceName} href={provincePath(summary.slug) as never}>
            <Card className="h-full space-y-1 transition hover:border-brand-300">
              <h2 className="font-display text-2xl text-ink">{provinceName}</h2>
              <p className="text-sm text-slate-600">{summary.cities} ciudades indexables</p>
              <p className="text-sm text-slate-600">{summary.schools} colegios activos</p>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
