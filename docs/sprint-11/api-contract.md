# Sprint 11 - API Contract (AI Matching)

## GET /v1/matches

Calcula recomendaciones vía query params.

## POST /v1/matches/recommend

Calcula recomendaciones vía body JSON.

### Input principal

- `country` (opcional)
- `province` (opcional)
- `city` (opcional)
- `childAge` (2-18)
- `educationLevel` (`INICIAL | PRIMARIA | SECUNDARIA`)
- `budgetMin` (opcional)
- `budgetMax` (opcional)
- `maxDistanceKm` (1-80)
- `preferredTypes` (opcional, CSV o array):
  - `BILINGUAL | RELIGIOUS | MONTESSORI | INTERNATIONAL | TECHNICAL | ARTISTIC | SPORTS | TRADITIONAL`
- `priorities` (opcional, CSV o array)
- `queryText` (opcional)
- `limit` (1-20)

### Ejemplo request (POST)

```json
{
  "city": "longchamps",
  "childAge": 9,
  "educationLevel": "PRIMARIA",
  "budgetMax": 280000,
  "maxDistanceKm": 8,
  "preferredTypes": ["BILINGUAL", "INTERNATIONAL"],
  "priorities": ["Ingles fuerte", "Jornada completa"],
  "queryText": "Busco colegio con buen inglés y jornada completa",
  "limit": 5
}
```

### Ejemplo response (resumido)

```json
{
  "session": { "id": "cm...", "createdAt": "2026-03-05T00:00:00.000Z" },
  "criteria": { "educationLevel": "PRIMARIA", "inferredTypes": ["BILINGUAL"] },
  "meta": { "totalConsidered": 24, "totalMatched": 5 },
  "items": [
    {
      "rank": 1,
      "score": 91.4,
      "distanceKm": 2.7,
      "highlights": ["Dentro del radio objetivo (2.7 km)", "Cuota alineada al presupuesto"],
      "breakdown": {
        "distance": 94,
        "budget": 100,
        "level": 100,
        "quality": 88,
        "intent": 80,
        "total": 91.4
      },
      "school": { "name": "North Hills College", "slug": "north-hills-college" }
    }
  ]
}
```
