# Sprint 13 - API Contract (Data Intelligence)

## GET /v1/rankings

Ranking real por ciudad.

### Query params

- `country` (opcional)
- `province` (opcional)
- `city` (opcional)
- `limit` (1-100, default 12)

### Response (resumido)

```json
{
  "generatedAt": "2026-03-05T00:00:00.000Z",
  "scope": { "country": "AR", "province": null, "city": null },
  "items": [
    {
      "rank": 1,
      "city": {
        "name": "Longchamps",
        "slug": "longchamps",
        "province": "Buenos Aires",
        "country": "Argentina",
        "countryCode": "AR"
      },
      "schools": 12,
      "topScore": 91,
      "averageScore": 86.4,
      "topSchools": [{ "id": "cm...", "name": "North Hills College", "slug": "north-hills-college", "score": 91 }]
    }
  ]
}
```

## GET /v1/market-insights

Métricas agregadas de mercado educativo.

### Query params

- `country` (opcional)
- `province` (opcional)
- `city` (opcional)
- `windowDays` (7-365, default 30)
- `topLimit` (1-20, default 5)

### Response (resumido)

```json
{
  "generatedAt": "2026-03-05T00:00:00.000Z",
  "metrics": {
    "avgMonthlyFee": 236000,
    "monthlyFeeRange": { "min": 180000, "max": 290000 },
    "demandByLevel": { "INICIAL": 4, "PRIMARIA": 12, "SECUNDARIA": 7 },
    "satisfactionAverage": 4.5,
    "totalSchools": 34,
    "totalLeadsWindow": 56
  },
  "topCities": [{ "city": "Longchamps", "schools": 12, "leadsWindow": 19 }],
  "mostSearchedSchools": [{ "schoolName": "North Hills College", "leads": 9, "interestScore": 21 }],
  "leadTrend": [{ "month": "2026-03", "leads": 14 }]
}
```

## POST /v1/market-insights/recompute

Recalcula snapshots diarios de inteligencia (admin).

### Headers

- `x-admin-key: <ADMIN_API_KEY>`

### Response (resumido)

```json
{
  "generatedAt": "2026-03-05T00:00:00.000Z",
  "snapshotDate": "2026-03-05T00:00:00.000Z",
  "schoolsProcessed": 120,
  "scoreRows": 120,
  "schoolMetricsRows": 120,
  "marketMetricsRows": 65
}
```
