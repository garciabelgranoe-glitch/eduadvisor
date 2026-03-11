# Sprint 9 - Runbook localhost

## Variables mínimas

```bash
API_URL=http://localhost:4000
ADMIN_API_KEY=dev-admin-key
```

## URLs de panel admin

- `http://localhost:3000/admin`
- `http://localhost:3000/admin/schools`
- `http://localhost:3000/admin/reviews`
- `http://localhost:3000/admin/analytics`

## Validación API admin

```bash
curl -H "x-admin-key: dev-admin-key" "http://localhost:4000/v1/admin/overview"

curl -H "x-admin-key: dev-admin-key" "http://localhost:4000/v1/admin/schools?status=active&limit=20"

curl -X PATCH \
  -H "x-admin-key: dev-admin-key" \
  -H "content-type: application/json" \
  -d '{"active":false}' \
  "http://localhost:4000/v1/admin/schools/<schoolId>/status"
```
