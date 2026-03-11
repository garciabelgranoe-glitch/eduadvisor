# Sprint 14 - Caching Architecture

Objetivo: bajar latencia y carga de base en endpoints de alto tráfico sin sacrificar consistencia.

## Estrategia

- Capa `CacheService` global en NestJS (`apps/api/src/common/cache`).
- `Redis first` con fallback a memoria local en caso de caída de Redis.
- Versionado por namespace para invalidación masiva sin `SCAN`/`DEL` por patrón.
- TTL corto para datos volátiles y medio para agregados.

## Namespaces

- `search` (TTL 90s)
- `schools:list` (TTL 180s)
- `schools:search` (TTL 90s)
- `schools:detail` (TTL 300s)
- `schools:seo:cities` (TTL 600s)
- `schools:seo:city-detail` (TTL 600s)
- `schools:seo:sitemap` (TTL 600s)
- `rankings` (TTL 300s)
- `insights` (TTL 300s)

## Invalidación

- `POST /v1/search/reindex`: invalida `search`, `schools:*`, `rankings`, `insights`.
- `PATCH /v1/schools/id/:schoolId/profile`: invalida `schools:*`, `search`, `rankings`, `insights`.
- `PATCH /v1/reviews/:reviewId/moderate`: invalida `schools:*`, `search`, `rankings`, `insights`.
- `POST /v1/leads` y `PATCH /v1/leads/:leadId/status`: invalida `insights`.
- `POST /v1/market-insights/recompute`: invalida `insights`, `rankings`, `schools:*`, `search`.
