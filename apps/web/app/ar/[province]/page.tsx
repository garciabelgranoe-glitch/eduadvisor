import Link from "next/link";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { JsonLd } from "@/components/seo/json-ld";
import { getSeoCities } from "@/lib/api";
import {
  buildPageMetadata,
  canonicalizeSlug,
  buildBreadcrumbSchema,
  cityPath,
  provincePath
} from "@/lib/seo";

export const revalidate = 3600;

interface ProvincePageProps {
  params: {
    province: string;
  };
}

export async function generateStaticParams() {
  const cities = await getSeoCities({ country: "AR", limit: "5000" });
  const provinces = new Set(cities.items.map((city) => city.provinceSlug));

  return Array.from(provinces).map((province) => ({ province }));
}

export async function generateMetadata({ params }: ProvincePageProps): Promise<Metadata> {
  const canonicalProvince = canonicalizeSlug(params.province);
  const cities = await getSeoCities({ country: "AR", province: canonicalProvince, limit: "5000" });
  const provinceName = cities.items[0]?.province ?? "Provincia";

  return buildPageMetadata({
    title: `Colegios privados en ${provinceName}`,
    description: `Explorá ciudades y colegios privados en ${provinceName} con datos comparables, rankings y perfiles detallados.`,
    canonicalPath: provincePath(canonicalProvince)
  });
}

export default async function ProvincePage({ params }: ProvincePageProps) {
  const canonicalProvince = canonicalizeSlug(params.province);

  if (canonicalProvince !== params.province) {
    permanentRedirect(provincePath(canonicalProvince));
  }

  const cities = await getSeoCities({ country: "AR", province: canonicalProvince, limit: "5000" });

  if (cities.items.length === 0) {
    notFound();
  }

  const provinceName = cities.items[0].province;

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Inicio", path: "/" },
    { name: "Argentina", path: "/ar" },
    { name: provinceName, path: provincePath(canonicalProvince) }
  ]);

  return (
    <section className="space-y-6">
      <JsonLd data={breadcrumbSchema} />

      <Card className="space-y-3 bg-gradient-to-r from-brand-50 to-white">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-700">Landing provincial</p>
        <h1 className="font-display text-4xl text-ink">Colegios privados en {provinceName}</h1>
        <p className="max-w-3xl text-sm text-slate-600">
          Navegá por ciudades con intención local consolidada para encontrar listados, rankings y perfiles de colegio.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cities.items.map((city) => (
          <Link key={city.slug} href={cityPath(city.provinceSlug, city.slug) as never}>
            <Card className="h-full space-y-1 transition hover:border-brand-300">
              <h2 className="text-xl font-semibold text-ink">{city.city}</h2>
              <p className="text-sm text-slate-600">{city.schoolCount} colegios activos</p>
              <p className="text-sm text-slate-600">Ruta canónica: {city.provinceSlug}/{city.slug}</p>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
