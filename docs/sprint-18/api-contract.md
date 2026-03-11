# Sprint 18 - API Contract

## Endpoints backend

### `GET /v1/parents/:userId/dashboard`

Headers:

- `x-admin-key: <admin key con scope read>`

Respuesta (resumen):

```json
{
  "parent": {
    "id": "cuid",
    "email": "familia.demo@example.eduadvisor"
  },
  "metrics": {
    "savedSchools": 6,
    "activeComparisons": 3,
    "unreadAlerts": 0,
    "nextOpenHouse": null
  },
  "savedSchools": []
}
```

### `GET /v1/parents/:userId/saved-schools`

Headers:

- `x-admin-key: <admin key con scope read>`

### `POST /v1/parents/:userId/saved-schools`

Headers:

- `x-admin-key: <admin key con scope write>`
- `content-type: application/json`

Body:

```json
{
  "schoolId": "cuid"
}
```

### `DELETE /v1/parents/:userId/saved-schools/:schoolId`

Headers:

- `x-admin-key: <admin key con scope write>`

## Endpoints web internos

### `GET /api/parent/saved-schools`

- requiere cookie de sesión firmada de padre
- proxy a backend con `x-admin-key`

### `POST /api/parent/saved-schools`

Body:

```json
{
  "schoolId": "cuid"
}
```

### `DELETE /api/parent/saved-schools?schoolId=<cuid>`

- elimina favorito del usuario autenticado
