# Release Checklist Final - 2026-03-11

Estado actual: **PRE-DEPLOY READY (bloque operativo pendiente)**

## 1) Calidad tecnica (local, completado)

- [x] `corepack pnpm lint`
- [x] `corepack pnpm test`
- [x] `corepack pnpm build`
- [x] `corepack pnpm ci:full`
- [x] `corepack pnpm release:preflight` (script de readiness operativo agregado)
- [x] Ajuste de E2E criticos GTM-025 (`apps/web/tests/gtm-functional-integral.spec.ts`)
- [x] Lint real en API (`apps/api/package.json` -> `tsc --noEmit -p tsconfig.json`)

## 2) Gate CI en GitHub (pendiente)

- [ ] `quality` en verde
- [ ] `security-semgrep` en verde
- [ ] `security-secrets` en verde
- [ ] `security-dependencies` en verde
- [ ] `build` en verde
- [ ] `launch-evidence` en verde (artifact `launch-security-evidence`)

## 3) Variables de produccion (pendiente)

- [ ] `PRODUCTION_WEB_URL` configurada
- [ ] `PRODUCTION_API_URL` configurada
- [ ] `PRODUCTION_DATABASE_URL` configurada
- [ ] `SMOKE_ADMIN_READ_API_KEY` configurada para smoke protegido

## 4) Deploy + smoke (pendiente)

- [ ] Ejecutar workflow `deploy.yml` a entorno productivo
- [ ] Verificar job `post-deploy-smoke` en verde
- [ ] Descargar artifact `post-deploy-smoke`:
- [ ] `artifacts/smoke/summary.md`
- [ ] `artifacts/smoke/smoke.log`

## 5) Signoff final (pendiente)

- [ ] Ejecutar `corepack pnpm release:signoff` con links reales de CI/Deploy
- [ ] Actualizar `docs/security/evidence/go-no-go-latest.md` a `GO`
- [ ] Confirmar owner de decision y ventana de monitoreo reforzado (2h)

## 6) Comandos de cierre recomendados

```bash
# 1) Validacion completa local (ya ejecutada)
corepack pnpm ci:full

# 2) Con links reales de Actions al finalizar CI/deploy
GO_NO_GO_RELEASE_VERSION=2026.03-rc1 \
GO_NO_GO_CI_RUN_URL=<github-actions-ci-url> \
GO_NO_GO_DEPLOY_RUN_URL=<github-actions-deploy-url> \
GO_NO_GO_DECISION=GO \
GO_NO_GO_DECISION_OWNER="Equipo Plataforma" \
corepack pnpm release:signoff
```

## 7) Nota ejecutiva

El proyecto ya supera la barrera tecnica local de salida (quality gate verde).
La decision final `GO` depende ahora del bloque operativo en GitHub/produccion (jobs + smoke + signoff con URLs reales).
