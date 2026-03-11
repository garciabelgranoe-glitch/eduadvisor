# Sprint 16 - API Contract

## Nuevo endpoint

### `GET /v1/health/metrics`

Headers:

- `x-admin-key: <admin key con scope read>`

Response 200 (resumen):

```json
{
  "status": "ok",
  "service": "eduadvisor-api",
  "timestamp": "2026-03-05T00:00:00.000Z",
  "uptimeSeconds": 1234,
  "process": {
    "pid": 12345,
    "nodeVersion": "v20.x",
    "memoryMb": {
      "rss": 120.4,
      "heapTotal": 65.8,
      "heapUsed": 44.9,
      "external": 3.2
    }
  },
  "requests": {
    "startedAt": "2026-03-05T00:00:00.000Z",
    "totals": {
      "requests": 150,
      "errors": 8,
      "avgDurationMs": 24.7
    },
    "statusBuckets": {
      "2xx": 130,
      "3xx": 4,
      "4xx": 11,
      "5xx": 5
    },
    "topRoutes": []
  }
}
```

## Cambios de seguridad

- `POST /v1/search/reindex` ahora requiere `x-admin-key` con scope `write`.
- Endpoints admin existentes pasan a validarse por scope explícito (`read`/`write`).

## Rate limiting global

Todos los endpoints devuelven:

- `x-ratelimit-limit`
- `x-ratelimit-remaining`
- `x-ratelimit-reset`

Si excede el límite: `429 Too Many Requests` con header `retry-after`.
