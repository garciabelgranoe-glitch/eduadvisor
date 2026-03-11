# Sprint 6 - Runbook localhost

## Variables mínimas

Usar `.env` con:

```bash
API_URL=http://localhost:4000
ADMIN_API_KEY=dev-admin-key
```

## Flujo de prueba

1. Levantar stack y app.
2. Abrir `http://localhost:3000/review` y enviar una reseña.
3. Abrir `http://localhost:3000/admin/reviews` para moderar.
4. Revisar perfil de colegio en `/school/[slug]` para validar publicación tras aprobación.

## cURL moderación

```bash
curl -H "x-admin-key: dev-admin-key" "http://localhost:4000/v1/reviews/moderation/queue?status=PENDING"

curl -X PATCH \
  -H "x-admin-key: dev-admin-key" \
  -H "content-type: application/json" \
  -d '{"status":"APPROVED"}' \
  "http://localhost:4000/v1/reviews/<review_id>/moderate"
```
