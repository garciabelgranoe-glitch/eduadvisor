# Sprint 22 - API Contract

## Endpoints backend nuevos

### `GET /v1/admin/growth-funnel`

Headers:

- `x-admin-key: <admin key con scope read>`

Query params opcionales:

- `windowDays` (default `30`, min `7`, max `180`)
- `trendDays` (default `14`, min `7`, max `90`)

Respuesta:

```json
{
  "generatedAt": "2026-03-06T19:00:00.000Z",
  "windowDays": 30,
  "trendDays": 14,
  "stages": {
    "parentsTotal": 1200,
    "parentsWithSavedSchools": 640,
    "parentsWithComparisons": 380,
    "parentsWithLeads": 170,
    "parentsWithClosedLeads": 48
  },
  "conversion": {
    "toSaved": 53.33,
    "toCompared": 59.38,
    "toLead": 44.74,
    "toClosedLead": 28.24,
    "overallToClosedLead": 4.0
  },
  "dropOff": {
    "beforeSaved": 560,
    "beforeCompared": 260,
    "beforeLead": 210,
    "beforeClosedLead": 122
  },
  "recommendations": [],
  "trend": []
}
```

### `POST /v1/admin/growth-funnel/recompute`

Headers:

- `x-admin-key: <admin key con scope write>`
- `content-type: application/json`

Body opcional:

```json
{
  "windowDays": 30
}
```

Efecto:

- upsert de snapshot diario en `GrowthFunnelSnapshot`

## Respuesta extendida de parent dashboard

### `GET /v1/parents/:userId/dashboard`

Nuevo bloque:

```json
{
  "nextAction": {
    "stage": "SHORTLIST",
    "title": "Hacé tu primera comparación",
    "detail": "Compará 2 o 3 colegios guardados para definir prioridades de decisión.",
    "ctaLabel": "Ir al comparador",
    "ctaPath": "/compare"
  }
}
```
