# Sprint 1 - Product Architecture

## 1) Arquitectura técnica

### Visión macro

EDUADVISOR se diseña como plataforma **modular y multi-país** con separación explícita de capas:

- **Presentación**: `apps/web` (Next.js 14, App Router, Tailwind, React Query).
- **Core API**: `apps/api` (NestJS, módulos por dominio).
- **Datos**: PostgreSQL + Prisma (`packages/database`).
- **Búsqueda**: Meilisearch como read-model optimizado para filtros geográficos y semánticos.
- **Cache**: Redis para resultados de búsqueda/rankings de alto tráfico.
- **Analytics de producto**: PostHog + tablas agregadas diarias.
- **Storage**: Supabase Storage para assets de colegios.
- **Entrega global**: Vercel (web), Railway/Fly (api), Cloudflare CDN.

### Backend (Clean Architecture pragmática)

Cada módulo de NestJS sigue estructura:

- `controller`: contrato HTTP.
- `service`: casos de uso.
- `repository` (a implementar Sprint 3+): acceso a Prisma.
- `dto`: validación de entrada/salida.

Dominios iniciales:

- `schools`
- `reviews`
- `leads`
- `search`
- `matches` (AI School Matching)
- `intelligence` (Education Market Intelligence)
- `rankings` (EduAdvisor Score)
- `admin`

### Frontend

Arquitectura App Router con rutas públicas SEO-first y separación por features:

- Home y navegación principal.
- Search y detalle de colegio.
- Compare.
- Rankings.
- Matches.
- Market Insights.

Base lista para sumar:

- Shadcn UI components.
- Clerk/Auth.js.
- Integración Mapbox/Google Maps.

### Data architecture y escalabilidad

Modelo relacional normalizado para geografía:

- `Country -> Province -> City -> School`

Esto habilita expansión a múltiples países sin rediseño.

Capas analíticas incorporadas desde el inicio:

- `SchoolMetricsDaily`
- `MarketMetricDaily`
- `EduAdvisorScore`

Capas AI incorporadas desde el inicio:

- `ParentPreference`
- `MatchSession`
- `MatchResult`

## 2) Estructura de carpetas

Definida en `docs/sprint-1/repository-structure.md` y materializada en el repo.

## 3) Código inicial incluido

- Monorepo con `pnpm` + `turbo`.
- API NestJS con endpoints base:
  - `GET /v1/schools`
  - `GET /v1/schools/:slug`
  - `POST /v1/reviews`
  - `POST /v1/leads`
  - `GET /v1/search`
- Frontend Next.js con páginas:
  - `/`
  - `/search`
  - `/school/[slug]`
  - `/compare`
  - `/rankings`
  - `/matches`
  - `/market-insights`
- Prisma schema inicial listo para migraciones.
- Infra local con Postgres + Redis + Meilisearch.

## 4) Explicación técnica y decisiones clave

- **Monorepo**: reduce fricción entre equipos y evita drift entre backend/frontend.
- **Prisma + PostgreSQL**: balance entre velocidad de desarrollo y robustez ACID.
- **Meilisearch**: baja latencia y simpleza operativa para iterar rápido en relevancia.
- **Redis**: cache de consultas de alto tráfico y pre-cálculo de rankings.
- **Eventual consistency para analytics**: las métricas agregadas no bloquean flujo transaccional.
- **Diseño multi-país temprano**: evitar deuda técnica geográfica desde Argentina al resto de LatAm.

## NFRs objetivos (base Serie A)

- Disponibilidad objetivo API: 99.9%.
- p95 API pública: < 250ms para lecturas cacheadas.
- Escala objetivo: millones de usuarios y cientos de miles de colegios indexados.
- Observabilidad: logs estructurados + métricas + tracing (a cerrar en Sprint 12).
