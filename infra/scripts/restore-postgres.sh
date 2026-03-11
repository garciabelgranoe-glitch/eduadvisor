#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL es requerido}"

if [ "$#" -lt 1 ]; then
  echo "Uso: $0 <backup_file.dump>"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "Backup no encontrado: ${BACKUP_FILE}"
  exit 1
fi

echo "Restaurando backup ${BACKUP_FILE} en ${DATABASE_URL}"
pg_restore --clean --if-exists --no-owner --no-privileges --dbname "${DATABASE_URL}" "${BACKUP_FILE}"
echo "Restore completado."
