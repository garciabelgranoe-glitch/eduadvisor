import Link from "next/link";

const items = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/schools", label: "Colegios" },
  { href: "/admin/claims", label: "Claims" },
  { href: "/admin/reviews", label: "Reseñas" },
  { href: "/admin/billing", label: "Facturación" },
  { href: "/admin/analytics", label: "Analítica" },
  { href: "/admin/seo-health", label: "Salud SEO" },
  { href: "/admin/launch", label: "Salida a mercado" }
] as const;

export function AdminNav() {
  return (
    <nav className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded-full border border-brand-100 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
