# Runbook - Security Incident Response

Fecha: 2026-03-08  
Owner: Plataforma / Security

## 1) Objetivo

Responder incidentes de seguridad de forma consistente, reduciendo tiempo de detección, contención y recuperación.

## 2) Severidad

- `SEV-1`: acceso no autorizado activo, exfiltración probable/confirmada, caída total de autenticación o billing.
- `SEV-2`: abuso significativo con impacto parcial (fraude, brute-force masivo, bypass de controles).
- `SEV-3`: hallazgo de hardening sin explotación confirmada.

## 3) Flujo operativo

1. `Detectar`
- Fuente: alertas de monitoreo, CI security gates, reporte interno o externo.
- Crear ticket de incidente y canal dedicado (war room).

2. `Triage (<= 15 min)`
- Confirmar alcance inicial: endpoint, actor, ventana temporal, impacto.
- Asignar severidad (`SEV-1/2/3`) y responsable técnico.

3. `Contener (<= 30 min SEV-1)`
- Bloquear vector de ataque: rate-limit estricto, revocar claves, deshabilitar endpoint/ruta.
- Si aplica, activar modo degradado para componentes comprometidos.

4. `Erradicar`
- Aplicar fix de código/configuración.
- Validar con pruebas de regresión + prueba específica del incidente.

5. `Recuperar`
- Restaurar operación normal gradualmente.
- Monitorear métricas críticas por al menos 24h.

6. `Postmortem (<= 72h)`
- Línea de tiempo, causa raíz, impacto real.
- Plan de prevención con owners y fechas.

## 4) Checklist técnico

- Identificar `requestId`, ruta, método, actor y `sourceIp` desde logs `AUDIT`.
- Verificar intentos asociados en ventanas de 1h y 24h.
- Confirmar si hubo exposición de PII o secretos.
- Ejecutar rotación de credenciales si hubo sospecha de compromiso.

## 5) Comunicaciones

- `SEV-1`: notificación inmediata a owners de producto y plataforma.
- `SEV-2`: resumen en < 2h.
- `SEV-3`: reporte en ciclo de planificación semanal.

## 6) Criterio de cierre

- Vector bloqueado.
- Evidencia de mitigación en pruebas/logs.
- Acciones preventivas registradas en backlog.
