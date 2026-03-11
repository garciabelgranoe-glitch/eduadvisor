# Sprint 25 - Technical Explanation

## Qué problema resolvimos

- rutas clave podían fallar con experiencia degradada (pantalla blanca/texto plano)
- componentes cliente con `toLocaleString` podían generar mismatch de hidratación
- faltaban estados de carga explícitos en vistas core

## Implementación

- error boundaries jerárquicos en App Router para recuperación por segmento
- loadings visuales en root/admin/school-dashboard
- normalización de formato temporal en cliente con `formatDateTimeUtc`

## Impacto en producto

- mejora la confiabilidad percibida en navegación real
- baja incidencia de errores de hidratación reportados por usuarios
- reduce fricción operativa para demos locales y QA funcional

## Próximo paso recomendado

- Sprint 26: hardening de operaciones:
  - script único de arranque local (db + api + web)
  - smoke tests E2E para login, dashboards y billing admin
  - health gate automatizado previo a demo/deploy
