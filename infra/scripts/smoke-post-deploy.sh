#!/usr/bin/env bash
set -euo pipefail

WEB_BASE_URL="${SMOKE_WEB_BASE_URL:-${WEB_BASE_URL:-}}"
API_BASE_URL="${SMOKE_API_BASE_URL:-${API_BASE_URL:-}}"
ADMIN_READ_KEY="${SMOKE_ADMIN_READ_API_KEY:-${ADMIN_READ_API_KEY:-${ADMIN_API_KEY:-}}}"
RETRY_ATTEMPTS="${SMOKE_RETRY_ATTEMPTS:-20}"
RETRY_SLEEP_SECONDS="${SMOKE_RETRY_SLEEP_SECONDS:-10}"
CURL_TIMEOUT_SECONDS="${SMOKE_CURL_TIMEOUT_SECONDS:-20}"

if [[ -z "${WEB_BASE_URL}" || -z "${API_BASE_URL}" ]]; then
  echo "[smoke] SMOKE_WEB_BASE_URL y SMOKE_API_BASE_URL son requeridos."
  echo "[smoke] Ejemplo: SMOKE_WEB_BASE_URL=https://eduadvisor.com SMOKE_API_BASE_URL=https://api.eduadvisor.com"
  exit 1
fi

WEB_BASE_URL="${WEB_BASE_URL%/}"
API_BASE_URL="${API_BASE_URL%/}"

function info() {
  echo "[smoke] $*"
}

function fail() {
  echo "[smoke][ERROR] $*" >&2
  exit 1
}

function curl_body() {
  local method="$1"
  local url="$2"
  local headers=()
  shift 2

  while (($#)); do
    headers+=("$1")
    shift
  done

  curl -sS --max-time "${CURL_TIMEOUT_SECONDS}" -X "${method}" "${url}" "${headers[@]}"
}

function curl_status() {
  local method="$1"
  local url="$2"
  shift 2

  curl -sS --max-time "${CURL_TIMEOUT_SECONDS}" -o /dev/null -w "%{http_code}" -X "${method}" "${url}" "$@"
}

function assert_json_field_equals() {
  local json="$1"
  local field="$2"
  local expected="$3"

  local actual
  actual=$(printf '%s' "${json}" | node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync(0, 'utf8'));
const field = process.argv[1].split('.');
let current = data;
for (const segment of field) {
  if (current && Object.prototype.hasOwnProperty.call(current, segment)) {
    current = current[segment];
  } else {
    process.exit(2);
  }
}
process.stdout.write(String(current));
" "${field}") || fail "No se pudo leer campo JSON '${field}'."

  if [[ "${actual}" != "${expected}" ]]; then
    fail "Campo JSON '${field}' esperado='${expected}' recibido='${actual}'."
  fi
}

function wait_for_api_liveness() {
  info "Esperando API liveness en ${API_BASE_URL}/v1/health/live"

  local attempt=1
  while (( attempt <= RETRY_ATTEMPTS )); do
    local status
    status=$(curl_status GET "${API_BASE_URL}/v1/health/live") || status="000"
    if [[ "${status}" == "200" ]]; then
      local body
      body=$(curl_body GET "${API_BASE_URL}/v1/health/live")
      assert_json_field_equals "${body}" "status" "ok"
      info "API live OK"
      return
    fi

    info "Intento ${attempt}/${RETRY_ATTEMPTS}: API live status=${status}. Reintentando en ${RETRY_SLEEP_SECONDS}s..."
    sleep "${RETRY_SLEEP_SECONDS}"
    attempt=$((attempt + 1))
  done

  fail "API liveness no respondió 200 tras ${RETRY_ATTEMPTS} intentos."
}

function check_api_readiness() {
  info "Validando API readiness en ${API_BASE_URL}/v1/health/ready"
  local body
  body=$(curl_body GET "${API_BASE_URL}/v1/health/ready")

  local status
  status=$(printf '%s' "${body}" | node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync(0, 'utf8'));
process.stdout.write(String(data.status || 'unknown'));
") || fail "No se pudo parsear readiness JSON"

  if [[ "${status}" != "ready" && "${status}" != "degraded" ]]; then
    fail "Readiness status inválido: ${status}."
  fi

  assert_json_field_equals "${body}" "dependencies.database.available" "true"

  info "API ready status=${status} (database OK)."
}

function check_search_health() {
  info "Validando search health"
  local status
  status=$(curl_status GET "${API_BASE_URL}/v1/search/health") || status="000"
  if [[ "${status}" != "200" ]]; then
    fail "Search health devolvió status=${status}"
  fi
}

function check_admin_health() {
  info "Validando admin health"
  local body
  body=$(curl_body GET "${API_BASE_URL}/v1/admin/health")
  assert_json_field_equals "${body}" "status" "ok"
}

function check_metrics_endpoint() {
  if [[ -z "${ADMIN_READ_KEY}" ]]; then
    info "SMOKE_ADMIN_READ_API_KEY no configurado; se omite /v1/health/metrics y /v1/admin/overview"
    return
  fi

  info "Validando /v1/health/metrics con admin key"
  local metricsStatus
  metricsStatus=$(curl_status GET "${API_BASE_URL}/v1/health/metrics" -H "x-admin-key: ${ADMIN_READ_KEY}") || metricsStatus="000"
  if [[ "${metricsStatus}" != "200" ]]; then
    fail "/v1/health/metrics devolvió status=${metricsStatus}"
  fi

  info "Validando /v1/admin/overview con admin key"
  local overviewStatus
  overviewStatus=$(curl_status GET "${API_BASE_URL}/v1/admin/overview" -H "x-admin-key: ${ADMIN_READ_KEY}") || overviewStatus="000"
  if [[ "${overviewStatus}" != "200" ]]; then
    fail "/v1/admin/overview devolvió status=${overviewStatus}"
  fi
}

function check_web_routes() {
  info "Validando web home"
  local homeStatus
  homeStatus=$(curl_status GET "${WEB_BASE_URL}/") || homeStatus="000"
  if [[ "${homeStatus}" != "200" ]]; then
    fail "Home devolvió status=${homeStatus}"
  fi

  info "Validando /search"
  local searchStatus
  searchStatus=$(curl_status GET "${WEB_BASE_URL}/search") || searchStatus="000"
  if [[ "${searchStatus}" != "200" ]]; then
    fail "/search devolvió status=${searchStatus}"
  fi

  info "Validando /robots.txt"
  local robotsStatus
  robotsStatus=$(curl_status GET "${WEB_BASE_URL}/robots.txt") || robotsStatus="000"
  if [[ "${robotsStatus}" != "200" ]]; then
    fail "/robots.txt devolvió status=${robotsStatus}"
  fi

  info "Validando /sitemap_index.xml"
  local sitemapStatus
  sitemapStatus=$(curl_status GET "${WEB_BASE_URL}/sitemap_index.xml") || sitemapStatus="000"
  if [[ "${sitemapStatus}" != "200" ]]; then
    fail "/sitemap_index.xml devolvió status=${sitemapStatus}"
  fi
}

function check_web_capture_endpoint() {
  info "Validando /api/analytics/capture"
  local status
  status=$(curl -sS --max-time "${CURL_TIMEOUT_SECONDS}" -o /tmp/eduadvisor-smoke-capture.json -w "%{http_code}" \
    -X POST "${WEB_BASE_URL}/api/analytics/capture" \
    -H "content-type: application/json" \
    --data '{"event":"smoke_post_deploy","distinctId":"smoke-post-deploy","properties":{"source":"smoke_script"}}') || status="000"

  if [[ "${status}" != "202" ]]; then
    fail "/api/analytics/capture devolvió status=${status}"
  fi

  local body
  body=$(cat /tmp/eduadvisor-smoke-capture.json)
  assert_json_field_equals "${body}" "captured" "true"
}

function main() {
  info "Iniciando smoke post-deploy"
  info "WEB=${WEB_BASE_URL} API=${API_BASE_URL}"

  wait_for_api_liveness
  check_api_readiness
  check_search_health
  check_admin_health
  check_metrics_endpoint
  check_web_routes
  check_web_capture_endpoint

  info "Smoke post-deploy completado correctamente"
}

main "$@"
