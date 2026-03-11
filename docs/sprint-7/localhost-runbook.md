# Sprint 7 - Runbook localhost

## Variables mínimas

```bash
API_URL=http://localhost:4000
ADMIN_API_KEY=dev-admin-key
```

## Flujo funcional

1. Abrir perfil de colegio:
   - `http://localhost:3000/school/north-hills-college`
2. Enviar formulario de consulta (lead).
3. Abrir dashboard de colegio:
   - `http://localhost:3000/school-dashboard?school=north-hills-college`
4. Cambiar estado de leads desde el tablero.

## Validación rápida API

```bash
curl -X POST http://localhost:4000/v1/leads \
  -H "content-type: application/json" \
  -d '{"schoolId":"<id>","parentName":"Ana Perez","childAge":8,"educationLevel":"PRIMARIA","phone":"+54 11 5555 5555","email":"ana@mail.com"}'

curl -H "x-admin-key: dev-admin-key" "http://localhost:4000/v1/leads/school/<schoolId>?status=NEW"
```
