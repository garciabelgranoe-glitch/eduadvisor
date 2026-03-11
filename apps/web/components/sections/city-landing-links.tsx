import Link from "next/link";
import type { Route } from "next";
import { buildCityLandingPath } from "@/lib/seo/city-landing";
import type { SeoCityListItem } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";

interface CityLandingLinksProps {
  cities: SeoCityListItem[];
}

export function CityLandingLinks({ cities }: CityLandingLinksProps) {
  if (cities.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-brand-700">Explorar por ciudad</p>
        <h2 className="font-display text-3xl text-ink">Páginas SEO para descubrir colegios por zona</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cities.map((city) => (
          <Link key={city.slug} href={buildCityLandingPath(city.slug) as Route}>
            <Card className="h-full space-y-2 transition hover:-translate-y-0.5 hover:shadow-sm">
              <h3 className="font-display text-2xl text-ink">{city.city}</h3>
              <p className="text-sm text-slate-600">
                {city.province}, {city.country}
              </p>
              <p className="text-sm text-slate-600">{city.schoolCount} colegios activos</p>
              <p className="text-sm text-slate-600">
                Cuota promedio: <span className="font-semibold">{formatCurrency(city.averageMonthlyFee)}</span>
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
