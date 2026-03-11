# Sprint 21 - API Contract

## Endpoint nuevo de auditoría

### `GET /v1/admin/product-events`

Headers:

- `x-admin-key: <admin key con scope read>`

Query params:

- `type` (opcional): `REVIEW_APPROVED | SCHOOL_PROFILE_UPDATED | EDUADVISOR_SCORE_CHANGED`
- `schoolId` (opcional)
- `page` (opcional, default `1`)
- `limit` (opcional, default `30`, max `100`)

Respuesta:

```json
{
  "items": [
    {
      "id": "cuid",
      "type": "REVIEW_APPROVED",
      "dedupeKey": "review-approved:review-123",
      "title": "Nueva reseña aprobada",
      "message": "Colegio X recibió una nueva reseña de 5 estrellas.",
      "alertsCreated": 12,
      "createdAt": "2026-03-06T18:00:00.000Z",
      "school": {
        "id": "cuid",
        "name": "Colegio X",
        "slug": "colegio-x"
      }
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 30,
    "totalPages": 1,
    "hasNextPage": false
  }
}
```

## Triggers automáticos (sin endpoint nuevo)

### `PATCH /v1/reviews/:reviewId/moderate`

- transición a `APPROVED` genera evento `REVIEW_APPROVED` y alertas

### `PATCH /v1/schools/id/:schoolId/profile`

- cambios significativos de perfil generan `SCHOOL_PROFILE_UPDATED` y alertas

### `POST /v1/market-insights/recompute`

- recompute diario genera `EDUADVISOR_SCORE_CHANGED` si el delta supera threshold
