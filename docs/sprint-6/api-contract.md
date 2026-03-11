# Sprint 6 - API Contract (Reviews)

## POST `/v1/reviews`

Request:

```json
{
  "schoolId": "school_cuid",
  "rating": 5,
  "comment": "Excelente nivel academico y acompanamiento familiar constante."
}
```

Response:

```json
{
  "id": "review_cuid",
  "schoolId": "school_cuid",
  "rating": 5,
  "comment": "Excelente nivel academico y acompanamiento familiar constante.",
  "status": "PENDING",
  "createdAt": "2026-03-04T..."
}
```

## GET `/v1/reviews/school/:schoolId`

Response:

```json
{
  "items": [
    {
      "id": "review_cuid",
      "rating": 5,
      "comment": "...",
      "status": "APPROVED",
      "createdAt": "2026-03-04T..."
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

## GET `/v1/reviews/moderation/queue`

Headers:

- `x-admin-key: <ADMIN_API_KEY>`

Query:

- `status=PENDING|APPROVED|REJECTED`
- `page`, `limit`
- `schoolId` opcional

## PATCH `/v1/reviews/:reviewId/moderate`

Headers:

- `x-admin-key: <ADMIN_API_KEY>`

Request:

```json
{
  "status": "APPROVED"
}
```

Restricción: no acepta `PENDING`.
