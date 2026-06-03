import Link from "next/link";
import { citySchoolsPath } from "@/lib/seo";

const NAV_LINKS = [
  { label: "Buscar colegios", href: "/search" },
  { label: "Rankings", href: "/rankings" },
  { label: "Comparar colegios", href: "/compare" },
  { label: "Para colegios", href: "/para-colegios" }
];

const INSTITUCIONAL_LINKS = [
  { label: "Sobre Radar Educativo", href: "/sobre-nosotros" },
  { label: "Contacto", href: "mailto:hola@radareducativo.com" }
];

const LEGAL_LINKS = [
  { label: "Política de privacidad", href: "/privacidad" },
  { label: "Términos de uso", href: "/terminos" }
];

// Ciudades principales para SEO
const CITY_LINKS = [
  { label: "Buenos Aires", province: "buenos-aires", city: "buenos-aires" },
  { label: "Córdoba", province: "cordoba", city: "cordoba" },
  { label: "Rosario", province: "santa-fe", city: "rosario" },
  { label: "Mendoza", province: "mendoza", city: "mendoza" },
  { label: "La Plata", province: "buenos-aires", city: "la-plata" },
  { label: "Tucumán", province: "tucuman", city: "san-miguel-de-tucuman" },
  { label: "Mar del Plata", province: "buenos-aires", city: "mar-del-plata" },
  { label: "Salta", province: "salta", city: "salta" },
  { label: "Longchamps", province: "buenos-aires", city: "longchamps" },
  { label: "Adrogué", province: "buenos-aires", city: "adrogue" },
  { label: "Guernica", province: "buenos-aires", city: "guernica" },
  { label: "San Vicente", province: "buenos-aires", city: "san-vicente" }
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-brand-100 bg-brand-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-3">

          {/* Columna 1 — Navegación */}
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-300">Plataforma</p>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href as never}
                    className="text-sm text-slate-100 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 2 — Institucional */}
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-300">Radar Educativo</p>
            <ul className="space-y-2">
              {INSTITUCIONAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href as never}
                    className="text-sm text-slate-100 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href as never}
                    className="text-sm text-slate-100 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3 — Ciudades */}
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-300">Colegios por ciudad</p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
              {CITY_LINKS.map((city) => (
                <li key={city.city}>
                  <Link
                    href={citySchoolsPath(city.province, city.city) as never}
                    className="text-sm text-slate-100 hover:text-white transition-colors"
                  >
                    {city.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-brand-700 pt-6 md:flex-row">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-semibold text-white">Radar Educativo</span>
            <span className="text-brand-400">·</span>
            <span className="text-sm text-brand-300">Argentina</span>
          </div>
          <p className="text-xs text-brand-300">
            © {new Date().getFullYear()} Radar Educativo. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
