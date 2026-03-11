# Sprint 12 - Backup Runbook

## 1) Backup manual

```bash
DATABASE_URL=postgresql://user:pass@host:5432/db pnpm backup:db
```

Output esperado:

- `./artifacts/backups/eduadvisor_<timestamp>.dump`

## 2) Restore manual

```bash
DATABASE_URL=postgresql://user:pass@host:5432/db \
pnpm restore:db -- ./artifacts/backups/eduadvisor_<timestamp>.dump
```

## 3) Backup automático

Archivo: `.github/workflows/db-backup.yml`

- Trigger diario (`cron`) + manual.
- Crea dump y lo sube como artifact con retención de 14 días.

## 4) Recomendación operativa

- Replicar artifacts críticos a almacenamiento externo (S3/Supabase Storage) en siguiente iteración.
- Validar restore en ambiente staging al menos 1 vez por semana.
