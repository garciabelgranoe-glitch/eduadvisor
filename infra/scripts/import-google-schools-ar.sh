#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

if [[ -f "$REPO_ROOT/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$REPO_ROOT/.env"
  set +a
fi

API_BASE="${API_URL:-http://localhost:4000}/v1"
ADMIN_KEY="${ADMIN_API_KEY:-dev-admin-key}"
IMPORT_MAX_PAGES="${IMPORT_MAX_PAGES:-3}"
FETCH_DETAILS="${FETCH_DETAILS:-true}"
USE_FIXTURE_FALLBACK="${USE_FIXTURE_FALLBACK:-false}"
RUN_REINDEX="${RUN_REINDEX:-true}"
REQUEST_SLEEP_SECONDS="${REQUEST_SLEEP_SECONDS:-1}"
DRY_RUN="${DRY_RUN:-false}"

IMPORT_ENDPOINT="${API_BASE}/admin/import-runs"
REINDEX_ENDPOINT="${API_BASE}/search/reindex"

# 15 ciudades más grandes/estratégicas para lanzamiento en Argentina.
CITIES=(
  "Buenos Aires|CABA"
  "Cordoba|Córdoba"
  "Rosario|Santa Fe"
  "La Plata|Buenos Aires"
  "Mar del Plata|Buenos Aires"
  "San Miguel de Tucuman|Tucumán"
  "Salta|Salta"
  "Santa Fe|Santa Fe"
  "Corrientes|Corrientes"
  "Bahia Blanca|Buenos Aires"
  "Resistencia|Chaco"
  "Neuquen|Neuquén"
  "Santiago del Estero|Santiago del Estero"
  "Parana|Entre Ríos"
  "Mendoza|Mendoza"
)

echo "== EduAdvisor Google Import =="
echo "API base: $API_BASE"
echo "Max pages/run: $IMPORT_MAX_PAGES"
echo "Fetch details: $FETCH_DETAILS"
echo "Use fixture fallback: $USE_FIXTURE_FALLBACK"
echo "Dry run: $DRY_RUN"
echo

if [[ -z "${GOOGLE_PLACES_API_KEY:-}" ]]; then
  echo "WARN: GOOGLE_PLACES_API_KEY no está definido en .env."
  echo "WARN: el backend puede fallar si no tiene la key cargada."
  echo
fi

success_count=0
failed_count=0
failed_items=()

for item in "${CITIES[@]}"; do
  city="${item%%|*}"
  province="${item##*|}"
  query="colegios privados en ${city}, ${province}, Argentina"

  payload=$(cat <<JSON
{"source":"GOOGLE_PLACES","countryCode":"AR","province":"${province}","city":"${city}","query":"${query}","maxPages":${IMPORT_MAX_PAGES},"fetchDetails":${FETCH_DETAILS},"useFixtureFallback":${USE_FIXTURE_FALLBACK}}
JSON
)

  echo "-> Importando: ${city}, ${province}"

  if [[ "$DRY_RUN" == "true" ]]; then
    echo "   DRY_RUN payload: $payload"
    continue
  fi

  response_with_code=$(curl -sS -w '\n%{http_code}' -X POST "$IMPORT_ENDPOINT" \
    -H "x-admin-key: ${ADMIN_KEY}" \
    -H "content-type: application/json" \
    -d "$payload")

  http_code="$(printf '%s' "$response_with_code" | tail -n1)"
  body="$(printf '%s' "$response_with_code" | sed '$d')"

  run_id="$(printf '%s' "$body" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p' | head -n1)"
  run_status="$(printf '%s' "$body" | sed -n 's/.*"status":"\([^"]*\)".*/\1/p' | head -n1)"

  if [[ "$http_code" =~ ^2 ]]; then
    success_count=$((success_count + 1))
    echo "   OK (${http_code}) run=${run_id:-n/a} status=${run_status:-n/a}"
  else
    failed_count=$((failed_count + 1))
    failed_items+=("${city}, ${province} (HTTP ${http_code})")
    echo "   ERROR (${http_code}) body=${body}"
  fi

  sleep "$REQUEST_SLEEP_SECONDS"
done

if [[ "$DRY_RUN" == "true" ]]; then
  echo
  echo "Dry run finalizado."
  exit 0
fi

echo
echo "Resumen import:"
echo "- Exitosos: ${success_count}"
echo "- Fallidos: ${failed_count}"
if (( failed_count > 0 )); then
  echo "- Detalle fallos:"
  for failure in "${failed_items[@]}"; do
    echo "  - ${failure}"
  done
fi

if [[ "$RUN_REINDEX" == "true" ]]; then
  echo
  echo "-> Reindexando search..."
  reindex_response=$(curl -sS -X POST "$REINDEX_ENDPOINT" -H "x-admin-key: ${ADMIN_KEY}")
  echo "   Reindex response: ${reindex_response}"
fi

echo
echo "Proceso terminado."
