# Sprint 19 - API Contract

## Endpoints backend

### `GET /v1/parents/:userId/comparisons`

Headers:

- `x-admin-key: <admin key con scope read>`

Respuesta:

```json
{
  "items": [
    {
      "id": "cuid",
      "schoolSlugs": ["north-hills-college", "colegio-san-lucas"],
      "comparePath": "/compare/north-hills-college,colegio-san-lucas",
      "schools": [],
      "createdAt": "2026-03-06T18:00:00.000Z",
      "updatedAt": "2026-03-06T18:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "limit": 30
  }
}
```

### `POST /v1/parents/:userId/comparisons`

Headers:

- `x-admin-key: <admin key con scope write>`
- `content-type: application/json`

Body:

```json
{
  "schoolSlugs": ["north-hills-college", "colegio-san-lucas"]
}
```

Reglas:

- mínimo 2 y máximo 3 slugs
- slugs únicos y válidos
- todos los colegios deben estar activos

### `DELETE /v1/parents/:userId/comparisons/:comparisonId`

Headers:

- `x-admin-key: <admin key con scope write>`

## Endpoints web internos

### `GET /api/parent/comparisons`

- requiere cookie de sesión firmada de padre
- proxy a backend `GET /v1/parents/:userId/comparisons`

### `POST /api/parent/comparisons`

Body:

```json
{
  "schoolSlugs": ["north-hills-college", "colegio-san-lucas"]
}
```

### `DELETE /api/parent/comparisons?comparisonId=<cuid>`

- elimina comparación del padre autenticado
