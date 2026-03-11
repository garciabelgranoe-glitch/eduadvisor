# Sprint 5 - Frontend Core Architecture

## 1) Arquitectura técnica

Se implementó frontend core SSR sobre Next.js App Router conectado a API real.

### Capas principales

- `app/`:
  - páginas core `/, /search, /school/[slug], /compare`
  - SEO técnico (`robots.ts`, `sitemap.ts`, `not-found.tsx`)
- `lib/api/`:
  - cliente HTTP server-side para `schools` y `search`
  - tipos de contrato de backend
- `components/search`:
  - filtros por query params
  - cards de resultados reales
- `components/sections/compare-table`:
  - tabla comparativa con datos reales por slug

### Estrategia de render

- Server Components con `fetch` y `revalidate` para SEO + performance.
- Query params en `/search` para URLs compartibles e indexables.
- Metadata dinámica en `/school/[slug]`.

### Resiliencia

- Si API falla, se renderiza fallback visual sin romper navegación.
- Estado `not-found` dedicado para slug inexistente.
