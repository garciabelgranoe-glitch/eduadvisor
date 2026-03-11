# Security Evidence Pack

Este directorio guarda la evidencia de validación para launch gate de seguridad.

## Ejecutar

Desde raíz de repo:

```bash
corepack pnpm security:evidence
```

Preflight de readiness para deploy (secrets + quality + probes opcionales):

```bash
corepack pnpm release:preflight
```

Opciones:

```bash
# Omitir Playwright security suite
EVIDENCE_INCLUDE_WEB_SECURITY_TESTS=0 corepack pnpm security:evidence

# Omitir API security tests
EVIDENCE_INCLUDE_API_SECURITY_TESTS=0 corepack pnpm security:evidence

# Incluir dependency audit crítico (puede requerir red)
EVIDENCE_INCLUDE_AUDIT=1 corepack pnpm security:evidence
```

## Salidas

- Reporte timestamped: `docs/security/evidence/launch-evidence-<UTC>.md`
- Último reporte: `docs/security/evidence/latest.md`
- Logs por check: `docs/security/evidence/logs/<UTC>/*.log`
- Preflight timestamped: `docs/security/evidence/deploy-preflight-<UTC>.md`
- Último preflight: `docs/security/evidence/deploy-preflight-latest.md`

## Go/No-Go signoff

Generar documento de signoff usando la última evidencia:

```bash
corepack pnpm release:signoff
```

Opcionalmente podés incluir metadatos del release:

```bash
GO_NO_GO_RELEASE_VERSION=2026.03-rc1 \
GO_NO_GO_CI_RUN_URL=https://github.com/<org>/<repo>/actions/runs/<id> \
GO_NO_GO_DEPLOY_RUN_URL=https://github.com/<org>/<repo>/actions/runs/<id> \
GO_NO_GO_DECISION=PENDING \
GO_NO_GO_DECISION_OWNER="Equipo Plataforma" \
corepack pnpm release:signoff
```

Salidas:

- `docs/security/evidence/go-no-go-signoff-<UTC>.md`
- `docs/security/evidence/go-no-go-latest.md`

## Workflow GitHub (manual)

También podés generarlo desde Actions con el workflow:

- `.github/workflows/release-signoff.yml`

Inputs:

- `release_version`
- `ci_run_url`
- `deploy_run_url`
- `decision`
- `decision_owner`

Artefacto esperado:

- `release-signoff`
