# Sprint 23 - API Contract

## Endpoints backend nuevos

### `PATCH /v1/admin/schools/:schoolId/subscription`

Headers:

- `x-admin-key: <admin key con scope write>`
- `content-type: application/json`

Body:

```json
{
  "status": "ACTIVE",
  "planCode": "premium",
  "priceMonthly": 99000,
  "durationMonths": 12
}
```

Respuesta:

```json
{
  "id": "sub_cuid",
  "schoolId": "school_cuid",
  "status": "ACTIVE",
  "planCode": "premium",
  "priceMonthly": 99000,
  "startsAt": "2026-03-06T19:00:00.000Z",
  "endsAt": "2027-03-06T19:00:00.000Z",
  "createdAt": "2026-03-06T19:00:00.000Z"
}
```

### `GET /v1/schools/id/:schoolId/billing`

Headers:

- `x-admin-key: <admin key con scope read>`

Respuesta:

```json
{
  "school": {
    "id": "school_cuid",
    "name": "Colegio X",
    "slug": "colegio-x",
    "profile": {}
  },
  "billing": {
    "currentPlan": {},
    "entitlements": {
      "canManageLeads": true,
      "canRespondReviews": true,
      "canUsePremiumLeadExport": true,
      "canAccessPriorityPlacement": true
    },
    "upsell": null
  }
}
```

### `GET /v1/schools/id/:schoolId/leads/export`

Headers:

- `x-admin-key: <admin key con scope read>`

Regla:

- requiere entitlement premium activo (`canUsePremiumLeadExport`)

Respuesta:

```json
{
  "school": {
    "id": "school_cuid",
    "name": "Colegio X",
    "slug": "colegio-x"
  },
  "exportedAt": "2026-03-06T19:00:00.000Z",
  "fileName": "leads-colegio-x-2026-03-06.csv",
  "contentType": "text/csv; charset=utf-8",
  "csv": "lead_id,parent_name,..."
}
```

## Endpoints web internos nuevos

- `PATCH /api/admin/subscriptions/status`
- `GET /api/schools/leads-export?schoolId=<cuid>`
