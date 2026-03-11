# Sprint 8 - Runbook localhost

## Variables mínimas

```bash
API_URL=http://localhost:4000
ADMIN_API_KEY=dev-admin-key
```

## Flujo funcional

1. Abrir dashboard:
   - `http://localhost:3000/school-dashboard?school=north-hills-college`
2. Editar perfil institucional y guardar.
3. Validar métricas y tendencia de leads.
4. Cambiar estado de leads en pipeline.

## Validación API privada

```bash
curl -H "x-admin-key: dev-admin-key" \
  "http://localhost:4000/v1/schools/id/<schoolId>/dashboard"

curl -X PATCH \
  -H "x-admin-key: dev-admin-key" \
  -H "content-type: application/json" \
  -d '{"description":"Nueva descripcion institucional"}' \
  "http://localhost:4000/v1/schools/id/<schoolId>/profile"
```
