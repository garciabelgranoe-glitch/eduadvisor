# Sprint 17 - API Contract

## Nuevo endpoint

### `POST /v1/auth/session`

Headers:

- `x-admin-key: <admin key con scope write>`
- `content-type: application/json`

Request:

```json
{
  "email": "direccion@colegio.edu.ar",
  "role": "SCHOOL_ADMIN",
  "schoolSlug": "colegio-ejemplo"
}
```

Response 200 (resumen):

```json
{
  "user": {
    "id": "uuid",
    "email": "direccion@colegio.edu.ar",
    "role": "SCHOOL_ADMIN"
  },
  "scope": {
    "schoolId": "uuid",
    "schoolSlug": "colegio-ejemplo",
    "schoolName": "Colegio Ejemplo"
  }
}
```

## Reglas de validacion

- `role` permitido: `PARENT` o `SCHOOL_ADMIN`.
- `schoolSlug` obligatorio para `SCHOOL_ADMIN`.
- `SCHOOL_ADMIN` requiere representante asociado por email.
- `SCHOOL_ADMIN` requiere claim aprobado + colegio en estado `VERIFIED` o `PREMIUM`.

### `GET /v1/auth/school-claim-status`

Headers:

- `x-admin-key: <admin key con scope read>`

Query:

- `email=<email institucional>`
- `schoolSlug=<slug del colegio>`

Response 200 (resumen):

```json
{
  "canLogin": false,
  "reasonCode": "CLAIM_REQUIRED",
  "message": "Esta cuenta no tiene un claim aprobado para el colegio seleccionado.",
  "school": {
    "id": "uuid",
    "slug": "colegio-ejemplo",
    "name": "Colegio Ejemplo",
    "profileStatus": "BASIC"
  },
  "claim": {
    "status": "NO_CLAIM",
    "createdAt": null,
    "reviewedAt": null
  }
}
```

## Cambios en Web API

- `POST /api/session/role`:
  - ahora crea sesión firmada por identidad real.
  - valida `email`, `role`, `schoolSlug` y opcionalmente access code.
- `POST /api/session/school-claim-status`:
  - consulta estado de claim para login institucional.
- `GET /api/session/google/start` y `GET /api/session/google/callback`:
  - flujo OAuth de Google para cuentas de familia.
- `GET /api/session/me`:
  - expone `authenticated`, `appRole`, `email`, `schoolSlug`, `schoolId`.
- `POST /api/session/logout`:
  - limpia cookie nueva y cookie legacy.
