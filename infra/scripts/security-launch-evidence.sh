#!/usr/bin/env bash
set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
REPORT_DIR="${ROOT_DIR}/docs/security/evidence"
STAMP="$(date -u +"%Y%m%d-%H%M%SZ")"
LOG_DIR="${REPORT_DIR}/logs/${STAMP}"
REPORT_PATH="${REPORT_DIR}/launch-evidence-${STAMP}.md"
LATEST_PATH="${REPORT_DIR}/latest.md"

INCLUDE_WEB_SECURITY_TESTS="${EVIDENCE_INCLUDE_WEB_SECURITY_TESTS:-1}"
INCLUDE_API_SECURITY_TESTS="${EVIDENCE_INCLUDE_API_SECURITY_TESTS:-1}"
INCLUDE_AUDIT="${EVIDENCE_INCLUDE_AUDIT:-0}"

mkdir -p "${LOG_DIR}"

OVERALL_STATUS="PASS"
TOTAL_CHECKS=0
PASS_CHECKS=0
WARN_CHECKS=0
FAIL_CHECKS=0

CHECK_ROWS=()

slugify() {
  local value="$1"
  value="$(printf '%s' "${value}" | tr '[:upper:]' '[:lower:]')"
  value="${value// /-}"
  value="${value//\//-}"
  value="${value//:/-}"
  echo "${value//[^a-z0-9._-]/}"
}

run_check() {
  local name="$1"
  local critical="$2"
  local cmd="$3"

  local slug
  slug="$(slugify "${name}")"
  local log_file="${LOG_DIR}/${slug}.log"
  local status="PASS"

  TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

  if bash -lc "cd \"${ROOT_DIR}\" && ${cmd}" >"${log_file}" 2>&1; then
    PASS_CHECKS=$((PASS_CHECKS + 1))
  else
    if [[ "${critical}" == "yes" ]]; then
      status="FAIL"
      FAIL_CHECKS=$((FAIL_CHECKS + 1))
      OVERALL_STATUS="FAIL"
    else
      status="WARN"
      WARN_CHECKS=$((WARN_CHECKS + 1))
    fi
  fi

  CHECK_ROWS+=("| ${name} | ${status} | ${critical} | \`${cmd}\` | \`${log_file}\` |")
}

{
  echo "# Launch Security Evidence Pack"
  echo
  echo "- Generated (UTC): ${STAMP}"
  echo "- Workspace: \`${ROOT_DIR}\`"
  echo "- Include web security tests: \`${INCLUDE_WEB_SECURITY_TESTS}\`"
  echo "- Include api security tests: \`${INCLUDE_API_SECURITY_TESTS}\`"
  echo "- Include dependency audit: \`${INCLUDE_AUDIT}\`"
  echo
} >"${REPORT_PATH}"

run_check "API lint" "yes" "corepack pnpm --filter @eduadvisor/api lint"
run_check "Web lint" "yes" "corepack pnpm --filter @eduadvisor/web lint"

if [[ "${INCLUDE_API_SECURITY_TESTS}" == "1" ]]; then
  run_check \
    "API security tests" \
    "yes" \
    "corepack pnpm --filter @eduadvisor/api test -- src/common/rate-limit/rate-limit.service.spec.ts src/common/http-security/http-security.config.spec.ts src/common/observability/audit-log.service.spec.ts src/modules/billing/billing.service.spec.ts"
fi

if [[ "${INCLUDE_WEB_SECURITY_TESTS}" == "1" ]]; then
  run_check \
    "Web security tests" \
    "yes" \
    "corepack pnpm --filter @eduadvisor/web test -- tests/security-admin-rbac.spec.ts tests/security-authz-regression.spec.ts tests/security-school-profile-ownership.spec.ts tests/security-public-form-abuse.spec.ts tests/security-session-cookie-hardening.spec.ts tests/security-billing-authz.spec.ts tests/security-headers-web.spec.ts tests/security-claim-status-enumeration.spec.ts"
fi

run_check "API build" "yes" "corepack pnpm --filter @eduadvisor/api build"
run_check "Web build" "yes" "corepack pnpm --filter @eduadvisor/web build"

if [[ "${INCLUDE_AUDIT}" == "1" ]]; then
  run_check "Dependency audit (critical)" "no" "corepack pnpm audit --audit-level=critical"
fi

{
  echo "## Summary"
  echo
  echo "- Overall status: **${OVERALL_STATUS}**"
  echo "- Checks: ${TOTAL_CHECKS}"
  echo "- PASS: ${PASS_CHECKS}"
  echo "- WARN: ${WARN_CHECKS}"
  echo "- FAIL: ${FAIL_CHECKS}"
  echo
  echo "## Checks"
  echo
  echo "| Check | Status | Critical | Command | Log |"
  echo "|---|---|---|---|---|"
  for row in "${CHECK_ROWS[@]}"; do
    echo "${row}"
  done
} >>"${REPORT_PATH}"

cp "${REPORT_PATH}" "${LATEST_PATH}"

echo "Evidence report generated: ${REPORT_PATH}"
echo "Latest report: ${LATEST_PATH}"

if [[ "${OVERALL_STATUS}" == "FAIL" ]]; then
  exit 1
fi
