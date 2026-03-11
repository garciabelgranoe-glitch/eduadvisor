# Sprint 16 - Security & Observability Architecture

Objetivo: endurecer la plataforma para operación real con controles transversales de seguridad y telemetría.

## Capas implementadas

- `RateLimitGuard` global (APP_GUARD):
  - protege todos los endpoints por IP + método + path.
  - configuración por env (`RATE_LIMIT_MAX_REQUESTS`, `RATE_LIMIT_WINDOW_MS`).
  - headers de respuesta: `x-ratelimit-limit`, `x-ratelimit-remaining`, `x-ratelimit-reset`.
- `AdminApiKeyGuard` con scopes:
  - `read` y `write` mediante decorator `@AdminScopes(...)`.
  - soporte para `ADMIN_API_KEY` (full), `ADMIN_READ_API_KEY`, `ADMIN_WRITE_API_KEY`.
- Observabilidad runtime:
  - `RequestLoggingInterceptor` global (APP_INTERCEPTOR) conserva `x-request-id`.
  - `RequestMetricsService` agrega métricas in-memory por ruta y status.
  - endpoint `GET /health/metrics` (admin scope `read`).

## Decisiones de diseño

- Mantener componentes sin dependencias externas para reducir fricción en local y CI.
- Aplicar rate limiting global para cubrir rutas nuevas automáticamente.
- Exponer métricas en endpoint operativo protegido para debugging rápido y monitoreo inicial.
