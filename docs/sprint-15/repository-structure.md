# Sprint 15 - Repository Structure

Nuevos tests backend:

- `apps/api/src/common/cache/cache.service.spec.ts`
- `apps/api/src/modules/search/search.service.spec.ts`
- `apps/api/src/modules/leads/leads.service.spec.ts`
- `apps/api/src/modules/reviews/reviews.service.spec.ts`

Hardening de scripts frontend:

- `apps/web/package.json`
  - nuevo `dev:clean`
  - `start` forzado a `NODE_ENV=production`
