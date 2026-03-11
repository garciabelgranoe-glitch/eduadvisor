# Sprint 20 - API Contract

## Endpoints backend

### `GET /v1/parents/:userId/alerts`

Headers:

- `x-admin-key: <admin key con scope read>`

Respuesta:

```json
{
  "items": [
    {
      "id": "cuid",
      "type": "SAVED_SCHOOL_ADDED",
      "title": "Colegio guardado",
      "message": "Guardaste North Hills College en tu shortlist.",
      "linkPath": "/school/north-hills-college",
      "isRead": false,
      "createdAt": "2026-03-06T18:00:00.000Z",
      "readAt": null,
      "school": {
        "id": "cuid",
        "name": "North Hills College",
        "slug": "north-hills-college"
      }
    }
  ],
  "meta": {
    "total": 1,
    "unread": 1,
    "limit": 30
  }
}
```

### `POST /v1/parents/:userId/alerts/:alertId/read`

Headers:

- `x-admin-key: <admin key con scope write>`

Respuesta:

```json
{
  "updated": true,
  "alertId": "cuid"
}
```

## Endpoints web internos

### `GET /api/parent/alerts`

- requiere sesión firmada con rol `PARENT`
- proxy a backend `GET /v1/parents/:userId/alerts`

### `POST /api/parent/alerts`

Body:

```json
{
  "alertId": "cuid"
}
```

- marca alerta como leída para el usuario autenticado
