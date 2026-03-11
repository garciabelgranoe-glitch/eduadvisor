#!/usr/bin/env bash
set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
REPORT_DIR="${ROOT_DIR}/docs/security/evidence"
STAMP="$(date -u +"%Y%m%d-%H%M%SZ")"
LOG_DIR="${REPORT_DIR}/logs/${STAMP}"
REPORT_PATH="${REPORT_DIR}/deploy-preflight-${STAMP}.md"
LATEST_PATH="${REPORT_DIR}/deploy-preflight-latest.md"

RUN_LOCAL_CI_FULL="${PREFLIGHT_RUN_LOCAL_CI_FULL:-1}"
RUN_REMOTE_PROBES="${PREFLIGHT_RUN_REMOTE_PROBES:-1}"
CHECK_TIMEOUT_SECONDS="${PREFLIGHT_CHECK_TIMEOUT_SECONDS:-15}"

mkdir -p "${LOG_DIR}"

TOTAL_CHECKS=0
PASS_CHECKS=0
WARN_CHECKS=0
FAIL_CHECKS=0
OVERALL_STATUS="PASS"

CHECK_ROWS=()

slugify() {
  local value="$1"
  value="$(printf '%s' "${value}" | tr '[:upper:]' '[:lower:]')"
  value="${value// /-}"
  value="${value//\//-}"
  value="${value//:/-}"
  echo "${value//[^a-z0-9._-]/}"
}

record_check() {
  local name="$1"
  local status="$2"
  local critical="$3"
  local details="$4"
  local log_file="$5"

  TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

  if [[ "${status}" == "PASS" ]]; then
    PASS_CHECKS=$((PASS_CHECKS + 1))
  elif [[ "${status}" == "WARN" ]]; then
    WARN_CHECKS=$((WARN_CHECKS + 1))
  else
    FAIL_CHECKS=$((FAIL_CHECKS + 1))
    if [[ "${critical}" == "yes" ]]; then
      OVERALL_STATUS="FAIL"
    fi
  fi

  CHECK_ROWS+=("| ${name} | ${status} | ${critical} | ${details} | \`${log_file}\` |")
}

is_http_url() {
  local value="$1"
  [[ "${value}" =~ ^https?://[^[:space:]]+$ ]]
}

check_required_env() {
  local var_name="$1"
  local critical="$2"
  local type="$3"
  local log_file="${LOG_DIR}/env-${var_name}.log"
  local value="${!var_name:-}"
  local status="PASS"
  local details="Definida"

  {
    echo "Variable: ${var_name}"
    if [[ -z "${value}" ]]; then
      echo "Estado: faltante"
      status="FAIL"
      details="Falta variable requerida"
    elif [[ "${type}" == "url" ]] && ! is_http_url "${value}"; then
      echo "Estado: invalida"
      status="FAIL"
      details="Formato invalido (se esperaba URL http/https)"
    else
      echo "Estado: ok"
    fi
  } >"${log_file}"

  record_check "Env ${var_name}" "${status}" "${critical}" "${details}" "${log_file}"
}

run_local_ci_full() {
  local log_file="${LOG_DIR}/local-ci-full.log"
  if [[ "${RUN_LOCAL_CI_FULL}" != "1" ]]; then
    echo "PREFLIGHT_RUN_LOCAL_CI_FULL=0, check omitido." >"${log_file}"
    record_check "Local ci:full" "WARN" "yes" "Omitido por configuracion" "${log_file}"
    return
  fi

  if bash -lc "cd \"${ROOT_DIR}\" && corepack pnpm ci:full" >"${log_file}" 2>&1; then
    record_check "Local ci:full" "PASS" "yes" "pnpm ci:full en verde" "${log_file}"
  else
    record_check "Local ci:full" "FAIL" "yes" "pnpm ci:full fallo" "${log_file}"
  fi
}

probe_url_status() {
  local name="$1"
  local url="$2"
  local expected="$3"
  local critical="$4"
  local log_file="${LOG_DIR}/probe-$(slugify "${name}").log"

  if [[ "${RUN_REMOTE_PROBES}" != "1" ]]; then
    echo "PREFLIGHT_RUN_REMOTE_PROBES=0, check omitido." >"${log_file}"
    record_check "${name}" "WARN" "${critical}" "Omitido por configuracion" "${log_file}"
    return
  fi

  local status
  status="$(curl -sS --max-time "${CHECK_TIMEOUT_SECONDS}" -o /tmp/eduadvisor-preflight-probe.out -w "%{http_code}" "${url}" 2>"${log_file}")"
  {
    echo "URL: ${url}"
    echo "HTTP status: ${status}"
    echo "Expected: ${expected}"
    cat /tmp/eduadvisor-preflight-probe.out
  } >>"${log_file}" 2>&1 || true

  if [[ "${status}" == "${expected}" ]]; then
    record_check "${name}" "PASS" "${critical}" "HTTP ${status}" "${log_file}"
  else
    record_check "${name}" "FAIL" "${critical}" "HTTP ${status} (esperado ${expected})" "${log_file}"
  fi
}

{
  echo "# Deploy Readiness Preflight"
  echo
  echo "- Generated (UTC): ${STAMP}"
  echo "- Workspace: \`${ROOT_DIR}\`"
  echo "- Run local ci:full: \`${RUN_LOCAL_CI_FULL}\`"
  echo "- Run remote probes: \`${RUN_REMOTE_PROBES}\`"
  echo
} >"${REPORT_PATH}"

# Required deploy/runtime secrets used by workflows
check_required_env "VERCEL_DEPLOY_HOOK_URL" "yes" "url"
check_required_env "RAILWAY_DEPLOY_HOOK_URL" "yes" "url"
check_required_env "PRODUCTION_WEB_URL" "yes" "url"
check_required_env "PRODUCTION_API_URL" "yes" "url"
check_required_env "PRODUCTION_DATABASE_URL" "yes" "url"
check_required_env "PRODUCTION_ADMIN_READ_API_KEY" "yes" "text"

# Local quality gate
run_local_ci_full

# Remote probes against production URLs (if provided)
if [[ -n "${PRODUCTION_WEB_URL:-}" && -n "${PRODUCTION_API_URL:-}" ]]; then
  probe_url_status "Probe web home" "${PRODUCTION_WEB_URL%/}/" "200" "yes"
  probe_url_status "Probe web robots" "${PRODUCTION_WEB_URL%/}/robots.txt" "200" "yes"
  probe_url_status "Probe api health live" "${PRODUCTION_API_URL%/}/v1/health/live" "200" "yes"
  probe_url_status "Probe api health ready" "${PRODUCTION_API_URL%/}/v1/health/ready" "200" "yes"
fi

RECOMMENDATION="GO"
if [[ "${OVERALL_STATUS}" == "FAIL" ]]; then
  RECOMMENDATION="NO_GO"
elif (( WARN_CHECKS > 0 )); then
  RECOMMENDATION="CONDITIONAL_GO"
fi

{
  echo "## Summary"
  echo
  echo "- Overall status: **${OVERALL_STATUS}**"
  echo "- Recommendation: **${RECOMMENDATION}**"
  echo "- Checks: ${TOTAL_CHECKS}"
  echo "- PASS: ${PASS_CHECKS}"
  echo "- WARN: ${WARN_CHECKS}"
  echo "- FAIL: ${FAIL_CHECKS}"
  echo
  echo "## Checks"
  echo
  echo "| Check | Status | Critical | Details | Log |"
  echo "|---|---|---|---|---|"
  for row in "${CHECK_ROWS[@]}"; do
    echo "${row}"
  done
  echo
  echo "## Next action"
  echo
  if [[ "${RECOMMENDATION}" == "GO" ]]; then
    echo "Listo para disparar deploy y completar signoff final con links de GitHub."
  elif [[ "${RECOMMENDATION}" == "CONDITIONAL_GO" ]]; then
    echo "Resolver checks en WARN antes de fijar decision final."
  else
    echo "Resolver checks en FAIL antes de avanzar con deploy."
  fi
} >>"${REPORT_PATH}"

cp "${REPORT_PATH}" "${LATEST_PATH}"

echo "Preflight report generated: ${REPORT_PATH}"
echo "Latest preflight report: ${LATEST_PATH}"

if [[ "${RECOMMENDATION}" == "NO_GO" ]]; then
  exit 1
fi
