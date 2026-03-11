# Sprint 10 - SEO y Crecimiento Architecture

## 1) Arquitectura técnica

Sprint 10 implementa una capa SEO programática orientada a escalar landing pages por ciudad y mejorar adquisición orgánica.

### Backend (NestJS)

Se extiende el módulo `schools` con endpoints SEO:

- `GET /v1/schools/seo/cities`
- `GET /v1/schools/seo/cities/:citySlug`
- `GET /v1/schools/seo/sitemap`

El backend calcula:

- ciudades con colegios activos y conteo por ciudad,
- métricas agregadas para landings (`schoolCount`, cuota promedio, rango de cuota, distribución por nivel),
- feed SEO para construir sitemap con páginas de colegios y páginas de ciudad.

### Frontend (Next.js App Router)

Se agrega una ruta programática de alto valor SEO:

- `/<colegios-en-:citySlug>` mediante `app/[cityLanding]/page.tsx`.

La página:

- valida patrón `colegios-en-*`,
- genera metadata dinámica (`title`, `description`, canonical y Open Graph),
- publica JSON-LD (`CollectionPage` + `ItemList`),
- renderiza listado real de colegios con data del backend.

### SEO técnico

- `sitemap.xml` ahora incluye:
  - rutas estáticas,
  - rutas de colegios (`/school/[slug]`),
  - rutas programáticas por ciudad (`/colegios-en-[ciudad]`).
- `robots.txt` habilita el crawl de `"/colegios-en-"`.
- Home suma enlaces internos a ciudades para mejorar discoverability e indexación.

## 2) Escalabilidad

- Endpoints SEO usan agregaciones SQL (`groupBy`, `aggregate`) para evitar N+1.
- `revalidate` en frontend para cache ISR controlada:
  - páginas ciudad: 15 min,
  - feed sitemap: 15 min,
  - catálogo ciudades: 60 min.
- Diseño preparado para multi-país vía filtros `country` / `province` en `seo/cities`.
