# Sprint 1 - SEO Strategy (SEO First)

## Objetivos

- Capturar búsquedas transaccionales: "colegios privados en [ciudad]".
- Capturar búsquedas informacionales: "mejores colegios bilingües en [zona]".
- Escalar páginas programáticas multi-país sin duplicación.

## Arquitectura SEO

- Next.js App Router con metadata por ruta y por entidad.
- Rutas base:
  - `/`
  - `/search`
  - `/school/[slug]`
  - `/compare`
  - `/rankings`
  - `/matches`
  - `/market-insights`
- Rutas programáticas (Sprint 10):
  - `/colegios-en-[ciudad]`
  - `/colegios-bilingues-en-[ciudad]`
  - `/rankings/[city]`

## Estrategia técnica

- ISR para páginas de colegios y rankings con invalidación por webhook.
- `sitemap.xml` segmentado por país/ciudad para millones de URLs.
- `robots.txt` conservador: indexar landings y perfiles, bloquear paneles.
- Schema.org:
  - `School`
  - `AggregateRating`
  - `Review`
  - `BreadcrumbList`
- Canonical por entidad para evitar canibalización entre filtros.
- Títulos y descripciones dinámicas con ciudad + propuesta de valor.

## Performance SEO

- Target Core Web Vitals:
  - LCP < 2.5s
  - INP < 200ms
  - CLS < 0.1
- Priorizar Server Components y streaming para páginas públicas.
- Cache por edge + CDN (Cloudflare) + cache semántica en Redis.
