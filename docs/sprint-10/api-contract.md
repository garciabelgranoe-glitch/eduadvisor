# Sprint 10 - API Contract (SEO)

## GET /v1/schools/seo/cities

Lista ciudades con colegios activos para generar landings SEO.

### Query params

- `country` (opcional): nombre o ISO code (`AR`)
- `province` (opcional): nombre o slug
- `limit` (opcional, 1-500, default 200)

### Response

```json
{
  "items": [
    {
      "city": "Longchamps",
      "slug": "longchamps",
      "province": "Buenos Aires",
      "provinceSlug": "buenos-aires",
      "country": "Argentina",
      "countryCode": "AR",
      "coordinates": { "latitude": -34.857, "longitude": -58.393 },
      "schoolCount": 12,
      "averageMonthlyFee": 220000
    }
  ],
  "meta": {
    "total": 1,
    "limit": 200
  }
}
```

## GET /v1/schools/seo/cities/:citySlug

Devuelve métricas agregadas para una landing específica.

### Response

```json
{
  "city": {
    "name": "Longchamps",
    "slug": "longchamps",
    "province": "Buenos Aires",
    "provinceSlug": "buenos-aires",
    "country": "Argentina",
    "countryCode": "AR",
    "coordinates": { "latitude": -34.857, "longitude": -58.393 }
  },
  "stats": {
    "schoolCount": 12,
    "averageMonthlyFee": 220000,
    "monthlyFeeRange": { "min": 180000, "max": 290000 },
    "levelDistribution": { "INICIAL": 8, "PRIMARIA": 11, "SECUNDARIA": 7 },
    "lastSchoolUpdateAt": "2026-03-04T10:15:00.000Z"
  }
}
```

## GET /v1/schools/seo/sitemap

Feed de URLs para construir `sitemap.xml`.

### Query params

- `limit` (opcional, 100-10000, default 5000)

### Response

```json
{
  "generatedAt": "2026-03-04T10:40:00.000Z",
  "schools": [
    { "slug": "north-hills-college", "lastModified": "2026-03-02T12:30:00.000Z" }
  ],
  "cities": [
    { "slug": "longchamps", "schoolCount": 12, "lastModified": "2026-03-02T12:30:00.000Z" }
  ]
}
```
