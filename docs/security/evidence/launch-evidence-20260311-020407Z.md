# Launch Security Evidence Pack

- Generated (UTC): 20260311-020407Z
- Workspace: `/Users/emilianobel/Desktop/Eduadvisor`
- Include web security tests: `1`
- Include api security tests: `1`
- Include dependency audit: `0`

## Summary

- Overall status: **PASS**
- Checks: 6
- PASS: 6
- WARN: 0
- FAIL: 0

## Checks

| Check | Status | Critical | Command | Log |
|---|---|---|---|---|
| API lint | PASS | yes | `corepack pnpm --filter @eduadvisor/api lint` | `/Users/emilianobel/Desktop/Eduadvisor/docs/security/evidence/logs/20260311-020407Z/api-lint.log` |
| Web lint | PASS | yes | `corepack pnpm --filter @eduadvisor/web lint` | `/Users/emilianobel/Desktop/Eduadvisor/docs/security/evidence/logs/20260311-020407Z/web-lint.log` |
| API security tests | PASS | yes | `corepack pnpm --filter @eduadvisor/api test -- src/common/rate-limit/rate-limit.service.spec.ts src/common/http-security/http-security.config.spec.ts src/common/observability/audit-log.service.spec.ts src/modules/billing/billing.service.spec.ts` | `/Users/emilianobel/Desktop/Eduadvisor/docs/security/evidence/logs/20260311-020407Z/api-security-tests.log` |
| Web security tests | PASS | yes | `corepack pnpm --filter @eduadvisor/web test -- tests/security-admin-rbac.spec.ts tests/security-authz-regression.spec.ts tests/security-school-profile-ownership.spec.ts tests/security-public-form-abuse.spec.ts tests/security-session-cookie-hardening.spec.ts tests/security-billing-authz.spec.ts tests/security-headers-web.spec.ts tests/security-claim-status-enumeration.spec.ts` | `/Users/emilianobel/Desktop/Eduadvisor/docs/security/evidence/logs/20260311-020407Z/web-security-tests.log` |
| API build | PASS | yes | `corepack pnpm --filter @eduadvisor/api build` | `/Users/emilianobel/Desktop/Eduadvisor/docs/security/evidence/logs/20260311-020407Z/api-build.log` |
| Web build | PASS | yes | `corepack pnpm --filter @eduadvisor/web build` | `/Users/emilianobel/Desktop/Eduadvisor/docs/security/evidence/logs/20260311-020407Z/web-build.log` |
