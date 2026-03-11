#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
EVIDENCE_DIR="${ROOT_DIR}/docs/security/evidence"
LATEST_EVIDENCE="${EVIDENCE_DIR}/latest.md"
STAMP="$(date -u +"%Y%m%d-%H%M%SZ")"
OUTPUT_PATH="${EVIDENCE_DIR}/go-no-go-signoff-${STAMP}.md"
LATEST_SIGNOFF_PATH="${EVIDENCE_DIR}/go-no-go-latest.md"

CI_RUN_URL="${GO_NO_GO_CI_RUN_URL:-pendiente}"
DEPLOY_RUN_URL="${GO_NO_GO_DEPLOY_RUN_URL:-pendiente}"
RELEASE_VERSION="${GO_NO_GO_RELEASE_VERSION:-release-candidate}"
DECISION="${GO_NO_GO_DECISION:-PENDING}"
DECISION_OWNER="${GO_NO_GO_DECISION_OWNER:-pendiente}"

if [[ ! -f "${LATEST_EVIDENCE}" ]]; then
  echo "No se encontró evidencia en ${LATEST_EVIDENCE}. Ejecuta primero: corepack pnpm security:evidence"
  exit 1
fi

EVIDENCE_STATUS="$(sed -n 's/^- Overall status: \*\*\(.*\)\*\*$/\1/p' "${LATEST_EVIDENCE}" | head -n 1)"
if [[ -z "${EVIDENCE_STATUS}" ]]; then
  EVIDENCE_STATUS="UNKNOWN"
fi

cat >"${OUTPUT_PATH}" <<EOF
# Go/No-Go Signoff

- Timestamp (UTC): ${STAMP}
- Release: ${RELEASE_VERSION}
- Decision: ${DECISION}
- Decision owner: ${DECISION_OWNER}

## Evidence links

- CI run: ${CI_RUN_URL}
- Deploy run: ${DEPLOY_RUN_URL}
- Security evidence: \`docs/security/evidence/latest.md\`

## Validation status

- Security evidence overall: **${EVIDENCE_STATUS}**
- CI jobs (\`quality\`, \`security-semgrep\`, \`security-secrets\`, \`security-dependencies\`, \`build\`, \`launch-evidence\`): ☐
- Deploy smoke (\`post-deploy-smoke\` + artifact): ☐
- Launch gate checklist actualizado: ☐

## Decision notes

- Riesgos residuales:
- Contingencia rollback:
- Fecha/hora ventana de monitoreo reforzado:
EOF

cp "${OUTPUT_PATH}" "${LATEST_SIGNOFF_PATH}"

echo "Signoff generado: ${OUTPUT_PATH}"
echo "Último signoff: ${LATEST_SIGNOFF_PATH}"
