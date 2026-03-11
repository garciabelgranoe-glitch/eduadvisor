# Sprint 30 - Localhost Runbook (GTM-030)

## Configuración de modo de lanzamiento

En `.env`:

```bash
LAUNCH_MODE=private  # private | public | open
```

Allowlists (cuando aplica):

```bash
BETA_PRIVATE_ALLOWED_PARENT_EMAILS=padre1@example.com,padre2@example.com
BETA_PRIVATE_ALLOWED_SCHOOL_SLUGS=colegio-a,colegio-b
BETA_PRIVATE_ALLOWED_SCHOOL_EMAILS=admin@colegio-a.edu.ar
```

Compatibilidad:

- Si `LAUNCH_MODE` no está definido y `BETA_PRIVATE_MODE_ENABLED=true`, se usa `PRIVATE`.
- Si ninguno está activo, el modo efectivo es `OPEN`.

## Verificar estado de beta

```bash
curl -s http://localhost:3000/api/beta/status | jq
```

## Verificar readiness de lanzamiento (admin)

Requiere cookie admin válida en navegador para `/admin/launch`.

También por API (con cookie admin):

```bash
curl -s http://localhost:3000/api/admin/launch-readiness | jq
```

## QA de gating

```bash
BETA_PRIVATE_MODE_ENABLED=true \
BETA_PRIVATE_ALLOWED_PARENT_EMAILS=beta.parent@example.eduadvisor \
BETA_PRIVATE_ALLOWED_SCHOOL_SLUGS=colegio-nacional-de-monserrat-u-n-c-cordoba \
corepack pnpm --filter @eduadvisor/web test -- tests/gtm-private-beta-access.spec.ts

LAUNCH_MODE=public \
corepack pnpm --filter @eduadvisor/web test -- tests/gtm-public-beta-access.spec.ts
```
