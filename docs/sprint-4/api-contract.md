# Sprint 4 - API Contract (Search Engine)

## GET `/v1/search`

### Query params soportados

- `q`
- `country`, `province`, `city`
- `level` (`INICIAL`, `PRIMARIA`, `SECUNDARIA`, múltiples por coma)
- `feeMin`, `feeMax`
- `ratingMin`
- `sortBy` (`relevance|name|monthlyFeeEstimate|createdAt`)
- `sortOrder` (`asc|desc`)
- `page`, `limit`

### Respuesta

```json
{
  "engine": "meilisearch",
  "query": "ingles",
  "items": [],
  "meta": {
    "total": 0,
    "page": 1,
    "limit": 12,
    "totalPages": 0,
    "hasNextPage": false
  }
}
```

## GET `/v1/search/health`

Retorna estado de conexión del motor de búsqueda e información básica del índice.

## POST `/v1/search/reindex`

Reconstruye el índice `schools` desde PostgreSQL.

Respuesta ejemplo:

```json
{
  "indexUid": "schools",
  "indexedSchools": 3,
  "documentsInIndex": 3
}
```
