# Sprint 14 - Repository Structure

Cambios principales:

- Nuevo módulo de caché:
  - `apps/api/src/common/cache/cache.module.ts`
  - `apps/api/src/common/cache/cache.service.ts`
- Integración de caché en servicios:
  - `apps/api/src/modules/search/search.service.ts`
  - `apps/api/src/modules/schools/schools.service.ts`
  - `apps/api/src/modules/rankings/rankings.service.ts`
  - `apps/api/src/modules/intelligence/intelligence.service.ts`
  - `apps/api/src/modules/reviews/reviews.service.ts`
  - `apps/api/src/modules/leads/leads.service.ts`
- Registro global del módulo en:
  - `apps/api/src/app.module.ts`
