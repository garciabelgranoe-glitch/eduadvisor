"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/hijos", label: "Mis hijos" },
  { href: "/actividades", label: "Actividades" },
  { href: "/inscripciones", label: "Inscripciones" },
  { href: "/pagos", label: "Pagos" },
  { href: "/documentos", label: "Documentos" }
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="main-nav" aria-label="Navegacion principal">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`nav-link${isActive ? " active" : ""}`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
