# Sprint 8 - API Contract (School Dashboard)

## GET `/v1/schools/id/:schoolId/dashboard`

Headers:

- `x-admin-key: <ADMIN_API_KEY>`

Response:

```json
{
  "school": {
    "id": "...",
    "name": "North Hills College",
    "slug": "north-hills-college",
    "description": "...",
    "monthlyFeeEstimate": 285000,
    "studentsCount": 1140,
    "levels": ["INICIAL", "PRIMARIA", "SECUNDARIA"],
    "location": {
      "city": "Longchamps",
      "province": "Buenos Aires",
      "country": "Argentina",
      "countryCode": "AR",
      "coordinates": { "latitude": -34.858, "longitude": -58.391 }
    },
    "contacts": {
      "website": "https://northhills.example",
      "phone": "+54 11 4000-1001",
      "email": "admisiones@northhills.example"
    }
  },
  "stats": {
    "leadsTotal": 42,
    "leadsByStatus": { "NEW": 12, "CONTACTED": 17, "QUALIFIED": 8, "CLOSED": 5 },
    "conversionRate": 11.9,
    "reviewsApproved": 15,
    "reviewsPending": 2,
    "ratingAverage": 4.6,
    "profileCompleteness": 86
  },
  "recentLeads": [],
  "leadTrend": [
    { "month": "2025-10", "leads": 6 }
  ]
}
```

## PATCH `/v1/schools/id/:schoolId/profile`

Headers:

- `x-admin-key: <ADMIN_API_KEY>`

Request (campos opcionales):

```json
{
  "name": "North Hills College",
  "description": "Nueva descripción",
  "website": "https://northhills.example",
  "phone": "+54 11 4000-1001",
  "email": "admisiones@northhills.example",
  "monthlyFeeEstimate": 295000,
  "studentsCount": 1160,
  "latitude": -34.858,
  "longitude": -58.391,
  "levels": ["INICIAL", "PRIMARIA", "SECUNDARIA"]
}
```

Response:

- Retorna el mismo payload estructural de `dashboard` actualizado.
