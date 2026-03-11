#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL es requerido}"

BACKUP_DIR="${BACKUP_DIR:-./artifacts/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP_FILE="${BACKUP_DIR}/eduadvisor_${TIMESTAMP}.dump"

mkdir -p "${BACKUP_DIR}"

echo "Creando backup en ${BACKUP_FILE}"
pg_dump --format=custom --no-owner --no-privileges --file "${BACKUP_FILE}" "${DATABASE_URL}"

find "${BACKUP_DIR}" -type f -name "*.dump" -mtime "+${RETENTION_DAYS}" -delete

echo "Backup completado: ${BACKUP_FILE}"
