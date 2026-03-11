# EduAdvisor Security Hardening Roadmap

Fecha de creacion: 2026-03-07  
Base tecnica: [audit-report.md](/Users/emilianobel/Desktop/Eduadvisor/docs/security/audit-report.md)
Plan operativo: [security-launch-30d-backlog.md](/Users/emilianobel/Desktop/Eduadvisor/docs/security/security-launch-30d-backlog.md)

## 1. Objetivo

Cerrar los hallazgos de seguridad priorizados (P0/P1/P2) y llevar la plataforma a estado **Go-Live Ready** sin romper los flujos core de producto (search, login, dashboards, billing, claims).

## 2. Alcance

- Frontend/BFF: `apps/web` (App Router + `app/api/*`)
- Backend: `apps/api` (NestJS)
- Infra/AppSec: CI/CD, headers de seguridad, secretos, rate limiting, auditoria

## 3. Criterio de exito (Launch Gate)

Se habilita produccion solo si se cumple todo lo siguiente:

1. P0 cerrados y cubiertos por tests automatizados.
2. P1 criticos cerrados (`headers`, rate limiting distribuido, CI security gates).
3. Secretos sin fallbacks inseguros en runtime productivo.
4. Evidencia en CI de controles de seguridad y checklist de operacion aprobado.

## 4. Roadmap por fases

## Fase 0 - Contencion P0
Ventana: 2026-03-09 a 2026-03-12

Objetivo:
- Eliminar superficies de escalacion de privilegios inmediatas.

Entregables:
1. Bloqueo de `app/api/admin/*` por sesion admin real + RBAC.
2. Bloqueo de `app/api/schools/*`, `app/api/reviews/*`, `app/api/leads/*` sensibles por sesion y ownership.
3. Eliminacion de acceso admin por `adminToken` en query.
4. Eliminacion de fallbacks `dev-*` en secretos criticos (`ADMIN_API_KEY`, `AUTH_SESSION_SECRET`).
5. Fail-fast de configuracion (arranque falla si falta env critica fuera de local dev).

Riesgos audit cubiertos:
- `P0-1`, `P0-2`, `P0-3`, `P0-4`

Aceptacion:
- Intentos anonimos a endpoints sensibles devuelven `401/403`.
- Usuario school solo opera sobre su `schoolId/schoolSlug`.
- Ninguna ruta admin acepta token por query string.

## Fase 1 - Cierre P1 de exposicion
Ventana: 2026-03-13 a 2026-03-18

Objetivo:
- Endurecer capa web/API frente a abuso, enumeracion y hardening HTTP.

Entregables:
1. Endurecer `/api/session/school-claim-status` contra enumeracion (auth/rate-limit/response shaping).
2. Migrar rate limiting a Redis distribuido (clave por IP + actor + endpoint).
3. Definir politicas de headers:
   - CSP
   - HSTS
   - X-Frame-Options
   - X-Content-Type-Options
   - Referrer-Policy
   - Permissions-Policy
4. Ajustes de CORS y cookies para entornos productivos.

Riesgos audit cubiertos:
- `P1-1`, `P1-2`, `P1-3`

Aceptacion:
- Misma politica de rate limit aplica en multi-instancia.
- Security headers presentes y validados en todas las respuestas web relevantes.

## Fase 2 - AppSec en pipeline y operacion
Ventana: 2026-03-19 a 2026-03-24

Objetivo:
- Hacer que seguridad sea una condicion de merge/deploy.

Entregables:
1. CI security gates obligatorios:
   - SAST (Semgrep)
   - Secret scanning
   - Dependency audit con umbrales de severidad
2. Corregir `.dockerignore` para excluir `.env` y artefactos sensibles.
3. Logging de auditoria:
   - actor
   - accion
   - recurso
   - resultado
   - redaccion de PII
4. Runbook de rotacion de secretos e incidente de seguridad.

Riesgos audit cubiertos:
- `P1-4`, `P1-5`

Aceptacion:
- PR no mergea si falla una politica AppSec critica.
- No se empaquetan secretos en imagen/contexto de build.

## Fase 3 - Endurecimiento avanzado
Ventana: 2026-03-25 a 2026-03-28

Objetivo:
- Mitigar fraude/abuso a nivel de negocio y fortalecer integraciones externas.

Entregables:
1. Anti-abuso en `leads`, `reviews`, `claim` (captcha/challenge y controles adaptativos).
2. Verificacion reforzada de webhooks de billing (firma HMAC robusta, antireplay y ventana temporal).
3. Plan de pruebas de seguridad repetibles (smoke + regression suite).

Riesgos audit cubiertos:
- `P2-1` + hardening preventivo de fraude.

Aceptacion:
- Simulaciones de replay webhook rechazadas.
- Disminucion medible de abuso en endpoints publicos.

## 5. Backlog priorizado (implementacion)

Prioridad alta:
1. Guards de sesion/RBAC en BFF sensibles (`admin`, `schools`, `reviews`, `leads`).
2. Sustituir admin auth por sesion de usuario admin (sin query secret).
3. Secret management estricto sin defaults inseguros.

Prioridad media:
1. Redis rate limit distribuido.
2. Headers de seguridad y politicas CSP por ruta.
3. CI AppSec gates.

Prioridad baja:
1. Hardening webhook avanzado.
2. Controles anti-abuso avanzados por formulario.

## 6. Seguimiento operativo

Cadencia:
- Daily de seguridad (15 min).
- Corte de avance cada 48h con estado por riesgo (`open`, `in-progress`, `mitigated`, `validated`).

Metrica de avance:
- `% P0 cerrados`
- `% P1 cerrados`
- `% endpoints sensibles con authz valida`
- `% cobertura de pruebas de seguridad en CI`

## 7. Dependencias

- Redis operativo para rate limiting distribuido.
- Definicion de modelo de usuario admin (identity source).
- Secret manager y politica de rotacion en entorno de despliegue.
- Ventana de QA para regresion funcional post-hardening.

## 8. Decision actual

Estado al 2026-03-07: **No Go-Live**  
Meta de salida condicionada: cierre Fase 0 + Fase 1 + gates minimos de Fase 2.
