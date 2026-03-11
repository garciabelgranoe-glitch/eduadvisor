# Sprint 16 - Repository Structure

Nuevos archivos:

- `apps/api/src/common/guards/admin-scope.decorator.ts`
- `apps/api/src/common/rate-limit/rate-limit.decorator.ts`
- `apps/api/src/common/rate-limit/rate-limit.guard.ts`
- `apps/api/src/common/rate-limit/rate-limit.service.ts`
- `apps/api/src/common/observability/request-metrics.service.ts`
- `apps/api/src/common/observability/observability.module.ts`
- `apps/api/src/common/guards/admin-api-key.guard.spec.ts`
- `apps/api/src/common/rate-limit/rate-limit.service.spec.ts`

Archivos actualizados:

- `apps/api/src/app.module.ts`
- `apps/api/src/main.ts`
- `apps/api/src/common/guards/admin-api-key.guard.ts`
- `apps/api/src/common/interceptors/request-logging.interceptor.ts`
- `apps/api/src/health/health.controller.ts`
- `apps/api/src/health/health.service.ts`
- `apps/api/src/health/health.module.ts`
- `apps/api/src/modules/search/search.controller.ts`
- `apps/api/src/modules/search/search.module.ts`
- controladores admin/schools/reviews/leads/intelligence con `@AdminScopes`
- `README.md`
- `.env.example`
