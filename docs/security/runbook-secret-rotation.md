# Runbook - Secret Rotation

Fecha: 2026-03-08  
Owner: Plataforma / Security

## 1) Objetivo

Rotar secretos críticos sin downtime y con trazabilidad.

## 2) Secretos críticos EduAdvisor

- `ADMIN_API_KEY`
- `AUTH_SESSION_SECRET`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `BILLING_WEBHOOK_SECRET*`
- `DATABASE_URL` (cuando aplique cambio de credenciales)
- `REDIS_URL` (si incluye credenciales)
- `ADMIN_CONSOLE_TOKEN` (solo fallback local/dev; no productivo)

## 3) Política de rotación

- Rotación programada: cada 90 días.
- Rotación inmediata: ante incidente o sospecha de exposición.
- Ningún secreto debe tener fallback inseguro en runtime productivo.

## 4) Procedimiento estándar (dual-key)

1. `Preparar`
- Generar nuevo secreto en gestor seguro.
- Registrar ticket de cambio con fecha/hora.

2. `Deploy de compatibilidad`
- Habilitar aceptación temporal de clave actual + nueva (si el componente lo permite).
- Desplegar backend/web.

3. `Conmutar`
- Actualizar secretos en proveedores (Vercel, Railway/Fly, CI).
- Verificar healthchecks y login/dashboard.

4. `Revocar clave antigua`
- Eliminar la clave anterior de configuración.
- Forzar redeploy de confirmación.

5. `Validar`
- Ejecutar smoke de seguridad:
  - auth padres/colegios/admin
  - endpoints admin críticos
  - webhooks de billing

6. `Cerrar`
- Documentar evidencia y timestamp de rotación.

## 5) Checklist por entorno

- `local`: `.env` de desarrollo (sin secretos reales de producción).
- `staging`: validar primero cambios y regresión.
- `production`: ejecutar ventana controlada y monitoreo activo.

## 6) Señales de éxito

- 0 errores 5xx derivados de autenticación/secrets.
- Login y rutas protegidas funcionando.
- Webhooks válidos aceptados; firmas antiguas rechazadas.
