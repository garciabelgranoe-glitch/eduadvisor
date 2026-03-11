# Sprint 9 - API Contract (Admin)

## GET `/v1/admin/overview`

Headers:

- `x-admin-key: <ADMIN_API_KEY>`

Response:

```json
{
  "schools": { "total": 1200, "active": 1100, "inactive": 100 },
  "reviews": { "pending": 32, "approved": 842, "rejected": 74, "total": 948 },
  "leads": {
    "total": 5240,
    "byStatus": { "NEW": 940, "CONTACTED": 2100, "QUALIFIED": 1320, "CLOSED": 880 },
    "conversionRate": 16.8
  },
  "leadTrend": [{ "month": "2026-03", "leads": 210 }],
  "topCities": [{ "city": "Buenos Aires", "schools": 120 }]
}
```

## GET `/v1/admin/schools`

Headers:

- `x-admin-key: <ADMIN_API_KEY>`

Query params:

- `q` (opcional)
- `status=all|active|inactive`
- `page`, `limit`
- `sortBy=name|createdAt`
- `sortOrder=asc|desc`

## PATCH `/v1/admin/schools/:schoolId/status`

Headers:

- `x-admin-key: <ADMIN_API_KEY>`

Request:

```json
{ "active": false }
```

Response:

```json
{
  "id": "...",
  "name": "...",
  "slug": "...",
  "active": false,
  "updatedAt": "2026-03-04T..."
}
```
