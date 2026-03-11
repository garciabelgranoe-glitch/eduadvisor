# EduAdvisor - Launch Gate de Seguridad (GO/NO-GO)

Fecha de corte: 10 de marzo de 2026  
Estado recomendado: **NO-GO** (release candidate con bloqueantes)  
Puntaje de seguridad actual: **8.0 / 10**

## 1. Regla de decision

Se autoriza lanzamiento solo si:

1. Todos los controles `P0` estan en `PASS`.
2. Todos los controles `P1` criticos estan en `PASS`.
3. CI de `main` en verde con gates de seguridad activos.
4. Evidencia adjunta en ticket de release (capturas, logs, links a workflows).

Si cualquier control `P0` o `P1` critico esta en `FAIL`, la decision es **NO-GO**.

## 2. Checklist ejecutivo (para Product Development)

| ID | Prioridad | Control | Owner | Criterio de PASS | Estado actual |
|---|---|---|---|---|---|
| LG-SEC-001 | P0 | Auth admin por identidad (no secreto compartido) | Backend + AppSec | Admin ligado a usuario/rol individual (PLATFORM_ADMIN), con trazabilidad por actor | PASS (validado 10-mar-2026 con Google OAuth intent=admin + allowlist) |
| LG-SEC-002 | P0 | Endpoints de billing protegidos por sesion + autorizacion | Backend + Frontend | `401/403` sin sesion valida, sin uso de `ADMIN_API_KEY` desde rutas publicas | PASS (validado 10-mar-2026 con `security-billing-authz.spec.ts`) |
| LG-SEC-003 | P0 | Rate limit distribuido obligatorio en prod | DevSecOps + Backend | Produccion no arranca o no opera sin Redis de rate limit | PASS (validado 10-mar-2026 con fail-fast env + tests unitarios) |
| LG-SEC-004 | P0 | RBAC/ownership en endpoints sensibles | Backend + Frontend | Tests de authz en verde para school/admin/parent | PASS (parcialmente validado) |
| LG-SEC-005 | P1 critico | Security headers + CSP efectivas | Frontend + DevSecOps | CSP/XFO/XCTO/Referrer/Permissions presentes en respuestas | PASS |
| LG-SEC-006 | P1 critico | CORS con allowlist explicita | Backend + DevSecOps | Solo origins permitidos en `CORS_ALLOWED_ORIGINS` | PASS |
| LG-SEC-007 | P1 critico | Gates AppSec en CI (SAST, secrets, deps) | DevSecOps | Workflow CI bloquea merge ante fallos de seguridad | PASS |
| LG-SEC-008 | P1 | Secrets hygiene y rotacion operativa | DevSecOps | Sin secretos en repo/imagen; runbook de rotacion aprobado | PASS |
| LG-SEC-009 | P1 | Logging/auditoria con redaccion de PII | Backend + AppSec | Eventos criticos con actor/accion/recurso y sin PII cruda | PASS (validar muestreo prod) |
| LG-SEC-010 | P2 | Anti-bot fuerte en formularios publicos | Frontend + Backend | Challenge/captcha en flujos de abuso alto | PASS (validado 10-mar-2026 con Turnstile server-side + widget en forms + `security-public-form-abuse.spec.ts`) |

## 3. Evidencia minima por control

Cada control debe adjuntar evidencia verificable en el ticket de release:

1. Link a PR mergeada.
2. Link al job de CI en verde.
3. Resultado de comando local/CI.
4. Captura o log (cuando aplique).

## 4. Comandos de validacion (local)

## 4.1 Baseline de calidad y build

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm test
pnpm --filter @eduadvisor/api prisma:generate
pnpm build
```

Atajo recomendado (genera reporte + logs):

```bash
corepack pnpm security:evidence
```

## 4.2 Gates AppSec equivalentes a CI

```bash
# Dependency audit (mismo criterio del workflow)
pnpm audit --audit-level=critical

# Semgrep (si esta instalado localmente)
semgrep scan --config p/owasp-top-ten --severity ERROR --error --exclude node_modules --exclude .next --exclude dist

# Gitleaks (si esta instalado localmente)
gitleaks git . --redact --verbose
```

## 4.3 Pruebas de seguridad del frontend/BFF

```bash
pnpm --filter @eduadvisor/web test -- tests/security-admin-rbac.spec.ts
pnpm --filter @eduadvisor/web test -- tests/security-authz-regression.spec.ts
pnpm --filter @eduadvisor/web test -- tests/security-school-profile-ownership.spec.ts
pnpm --filter @eduadvisor/web test -- tests/security-public-form-abuse.spec.ts
pnpm --filter @eduadvisor/web test -- tests/security-session-cookie-hardening.spec.ts
pnpm --filter @eduadvisor/web test -- tests/security-billing-authz.spec.ts
pnpm --filter @eduadvisor/web test -- tests/security-headers-web.spec.ts
pnpm --filter @eduadvisor/web test -- tests/security-claim-status-enumeration.spec.ts
```

## 4.4 Smoke manual rapido (sin credenciales)

Con web levantada localmente:

```bash
# Debe responder 401/403 en rutas sensibles sin sesion
curl -i -X POST http://localhost:3000/api/reviews/moderate -H "content-type: application/json" -d '{"reviewId":"x","status":"APPROVED"}'
curl -i "http://localhost:3000/api/schools/profile?schoolId=test"
curl -i "http://localhost:3000/api/schools/leads-export?schoolId=test"
curl -i -X POST http://localhost:3000/api/leads/status -H "content-type: application/json" -d '{"leadId":"x","status":"CLOSED"}'

# Headers de seguridad
curl -I http://localhost:3000/
```

## 5. Comandos de validacion (CI / release branch)

El workflow de referencia es `.github/workflows/ci.yml` y debe estar verde en:

1. `quality`
2. `security-semgrep`
3. `security-secrets`
4. `security-dependencies`
5. `build` (dependiente de los anteriores)
6. `launch-evidence` (solo `main`/manual, adjunta artefacto `launch-security-evidence`)

Checklist CI:

```bash
# Ejecutar en branch de release antes de merge
pnpm lint && pnpm test && pnpm --filter @eduadvisor/api prisma:generate && pnpm build
pnpm audit --audit-level=critical
```

Artefacto esperado en CI:

1. `launch-security-evidence`
2. Incluye `docs/security/evidence/latest.md` y `docs/security/evidence/logs/*`

## 5.1 Validacion post-deploy (workflow `deploy.yml`)

El job `post-deploy-smoke` debe finalizar en verde cuando hay URLs productivas configuradas.

Artefacto esperado en deploy:

1. `post-deploy-smoke`
2. Incluye:
   - `artifacts/smoke/summary.md`
   - `artifacts/smoke/smoke.log`

## 6. Bloqueantes actuales para pasar a GO

1. Ejecutar `corepack pnpm security:evidence` sobre branch candidata y adjuntar `docs/security/evidence/latest.md`.
2. Adjuntar links de CI (`quality`, `security-semgrep`, `security-secrets`, `security-dependencies`, `build`, `launch-evidence`) en ticket de release.
3. Adjuntar link del job `post-deploy-smoke` + artefacto `post-deploy-smoke` del último deploy.
4. Generar signoff (`corepack pnpm release:signoff`) y adjuntar `docs/security/evidence/go-no-go-latest.md`.
5. Firmar ticket Go/No-Go con evidencia completa.

Alternativa CI para punto 4:

- Ejecutar workflow manual `.github/workflows/release-signoff.yml` y adjuntar artefacto `release-signoff`.

## 7. Politica final de lanzamiento

1. **GO**: todos `P0/P1 criticos` en PASS + CI verde + evidencia completa.
2. **NO-GO**: cualquier `P0` FAIL, cualquier `P1 critico` FAIL, o evidencia incompleta.

## 8. Referencias internas

- `docs/security/audit-report.md`
- `docs/security/security-hardening-roadmap.md`
- `docs/security/security-launch-30d-backlog.md`
- `docs/security/runbook-security-incident.md`
- `docs/security/runbook-secret-rotation.md`
