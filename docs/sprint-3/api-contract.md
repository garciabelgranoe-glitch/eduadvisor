# Sprint 3 - API Contract (Core)

## GET `/v1/schools`

### Query params

- `country`, `province`, `city`
- `level` (ej: `PRIMARIA` o `INICIAL,PRIMARIA`)
- `feeMin`, `feeMax`
- `ratingMin`
- `page`, `limit`
- `sortBy`: `relevance|name|monthlyFeeEstimate|createdAt`
- `sortOrder`: `asc|desc`

### Response

```json
{
  "items": [
    {
      "id": "...",
      "name": "North Hills College",
      "slug": "north-hills-college",
      "levels": ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      "monthlyFeeEstimate": 285000,
      "studentsCount": 1140,
      "location": {
        "city": "Longchamps",
        "province": "Buenos Aires",
        "country": "Argentina",
        "countryCode": "AR",
        "coordinates": { "latitude": -34.858, "longitude": -58.391 }
      },
      "rating": { "average": 4.5, "count": 2 },
      "eduAdvisorScore": 91,
      "contacts": {
        "website": "https://northhills.example",
        "phone": "+54 11 4000-1001",
        "email": "admisiones@northhills.example"
      }
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 12,
    "totalPages": 1,
    "hasNextPage": false
  }
}
```

## GET `/v1/schools/:slug`

Retorna detalle institucional, rating agregado y últimas reviews aprobadas.

## POST `/v1/reviews`

### Request

```json
{
  "schoolId": "school_cuid",
  "userId": "user_cuid_optional",
  "rating": 5,
  "comment": "Excelente nivel academico y muy buen acompanamiento familiar."
}
```

### Response

```json
{
  "id": "review_cuid",
  "schoolId": "school_cuid",
  "userId": "user_cuid_optional",
  "rating": 5,
  "comment": "Excelente nivel academico y muy buen acompanamiento familiar.",
  "status": "PENDING",
  "createdAt": "2026-03-04T..."
}
```

## POST `/v1/leads`

### Request

```json
{
  "schoolId": "school_cuid",
  "parentName": "Ana Perez",
  "childAge": 8,
  "educationLevel": "PRIMARIA",
  "phone": "+54 11 5555 5555",
  "email": "ana@mail.com"
}
```

### Response

```json
{
  "id": "lead_cuid",
  "schoolId": "school_cuid",
  "parentName": "Ana Perez",
  "childAge": 8,
  "educationLevel": "PRIMARIA",
  "phone": "+54 11 5555 5555",
  "email": "ana@mail.com",
  "status": "NEW",
  "createdAt": "2026-03-04T..."
}
```

## GET `/v1/search`

Mismos filtros de `/schools` + `q` para búsqueda textual en nombre/descripción/ubicación.
