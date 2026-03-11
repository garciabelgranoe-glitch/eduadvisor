# Sprint 7 - API Contract (Leads)

## POST `/v1/leads`

Request:

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

Response:

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
  "createdAt": "2026-03-04T...",
  "targetSchool": {
    "id": "school_cuid",
    "name": "North Hills College",
    "slug": "north-hills-college",
    "email": "admisiones@northhills.example",
    "phone": "+54 11 4000-1001"
  }
}
```

Notas:

- Si hay duplicado reciente comparable, responde `409 Conflict`.

## GET `/v1/leads/school/:schoolId`

Headers:

- `x-admin-key: <ADMIN_API_KEY>`

Query params:

- `status=NEW|CONTACTED|QUALIFIED|CLOSED` (opcional)
- `query` (opcional, busca por nombre/email/teléfono)
- `page`, `limit`
- `sortBy=createdAt|childAge`
- `sortOrder=asc|desc`

## GET `/v1/leads/school/:schoolId/summary`

Headers:

- `x-admin-key: <ADMIN_API_KEY>`

Response:

```json
{
  "school": { "id": "...", "name": "...", "slug": "..." },
  "total": 42,
  "byStatus": {
    "NEW": 12,
    "CONTACTED": 17,
    "QUALIFIED": 8,
    "CLOSED": 5
  }
}
```

## PATCH `/v1/leads/:leadId/status`

Headers:

- `x-admin-key: <ADMIN_API_KEY>`

Request:

```json
{ "status": "CONTACTED" }
```
