# Deploy This Week Runbook

Fecha base: 2026-03-11

## Objetivo

Llegar a deploy productivo con evidencia completa (`GO`) en la misma semana, sin saltear gates de calidad/seguridad.

## Paso 1 - Preflight local (hoy)

Ejecutar:

```bash
corepack pnpm release:preflight
```

Salida esperada:

- `docs/security/evidence/deploy-preflight-latest.md` con `Recommendation: GO` o `CONDITIONAL_GO`.
- Si hay `NO_GO`, resolver primero variables faltantes o fallos de `ci:full`.

## Paso 2 - CI en GitHub (día de deploy)

Disparar CI sobre branch candidata (ideal `main`).

Checklist obligatorio en verde:

1. `quality`
2. `security-semgrep`
3. `security-secrets`
4. `security-dependencies`
5. `build`
6. `launch-evidence`

## Paso 3 - Deploy productivo

Disparar workflow `deploy.yml` y verificar:

1. `deploy-web`
2. `deploy-api`
3. `post-deploy-smoke`

Artifact requerido:

- `post-deploy-smoke` con:
  - `artifacts/smoke/summary.md`
  - `artifacts/smoke/smoke.log`

## Paso 4 - Signoff final

Con URLs reales de CI y deploy:

```bash
GO_NO_GO_RELEASE_VERSION=2026.03-rc1 \
GO_NO_GO_CI_RUN_URL=<github-actions-ci-url> \
GO_NO_GO_DEPLOY_RUN_URL=<github-actions-deploy-url> \
GO_NO_GO_DECISION=GO \
GO_NO_GO_DECISION_OWNER="Equipo Plataforma" \
corepack pnpm release:signoff
```

Archivos de salida:

- `docs/security/evidence/go-no-go-signoff-<UTC>.md`
- `docs/security/evidence/go-no-go-latest.md`

## Paso 5 - Cierre operativo

Confirmar en `go-no-go-latest.md`:

1. Decision `GO`
2. Owner definido
3. Riesgos residuales documentados
4. Ventana de monitoreo reforzado (recomendado: 2 horas post-release)

## Bloqueantes frecuentes

1. `PRODUCTION_WEB_URL` o `PRODUCTION_API_URL` faltantes: el smoke queda `SKIPPED`.
2. `PRODUCTION_DATABASE_URL` faltante: backup diario no ejecuta.
3. `PRODUCTION_ADMIN_READ_API_KEY` faltante: smoke protegido incompleto.

