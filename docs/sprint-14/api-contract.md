# Sprint 14 - API Contract Notes

No se agregan endpoints nuevos.  
Se mantiene contrato HTTP existente y se introduce caching transparente del lado backend.

## Endpoints con cache de lectura

- `GET /v1/search`
- `GET /v1/schools`
- `GET /v1/schools/:slug`
- `GET /v1/schools/seo/cities`
- `GET /v1/schools/seo/cities/:citySlug`
- `GET /v1/schools/seo/sitemap`
- `GET /v1/rankings`
- `GET /v1/market-insights`

## Endpoints que gatillan invalidación

- `POST /v1/search/reindex`
- `PATCH /v1/schools/id/:schoolId/profile`
- `PATCH /v1/reviews/:reviewId/moderate`
- `POST /v1/leads`
- `PATCH /v1/leads/:leadId/status`
- `POST /v1/market-insights/recompute`
