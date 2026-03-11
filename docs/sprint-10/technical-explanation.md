# Sprint 10 - Explicación técnica

## 1) Qué se implementó

- Motor SEO programático por ciudad con URLs tipo `/colegios-en-[ciudad]`.
- Metadata dinámica por landing (`title`, `description`, canonical, OpenGraph).
- JSON-LD `CollectionPage` para reforzar semantic SEO.
- Sitemap dinámico extendido con colegios y páginas de ciudad.
- Enlaces internos desde Home hacia ciudades para mejorar crawl depth.

## 2) Decisiones clave

- Resolver el patrón `/colegios-en-*` con una ruta dinámica de primer nivel (`[cityLanding]`) y validación estricta de prefijo.
- Delegar agregaciones SEO al backend para mantener frontend liviano y reutilizable.
- Reusar ISR en lugar de SSR puro para balancear frescura de datos y costo de infraestructura.

## 3) Verificación

- `corepack pnpm --filter @eduadvisor/api build` ✅
- `corepack pnpm --filter @eduadvisor/web lint` ✅
- `corepack pnpm --filter @eduadvisor/web build` ✅

## 4) Deuda explícita

- Falta generar `hreflang` multi-país cuando se habilite expansión regional.
- Falta paginación SEO por ciudad para listados muy grandes (`page/2`, `page/3`).
- Falta automatizar creación de landings por demanda de búsqueda (Search Console + PostHog).
