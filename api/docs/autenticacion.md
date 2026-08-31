# Autenticación (`/api/auth`, `/api/users`)

Ver también el flujo completo de autenticación en el [índice](/docs).

---

### POST /api/auth/register

**Autenticación:** No requiere

Crea una cuenta nueva y devuelve un par de tokens (el usuario queda logueado automáticamente tras registrarse).

**Body:**

```json
{
  "email": "juan@example.com",
  "password": "unaClaveSegura123",
  "name": "Juan Pérez"
}
```

| Campo    | Tipo   | Requerido | Descripción |
| -------- | ------ | --------- | ----------- |
| email    | string | sí        | Debe ser un email válido |
| password | string | sí        | Mínimo 8 caracteres |
| name     | string | no        | Nombre a mostrar |

**Respuesta exitosa (201):**

```json
{
  "user": {
    "id": "cly3x9f8h0000abc123",
    "email": "juan@example.com",
    "name": "Juan Pérez",
    "preferredUnit": "kg",
    "createdAt": "2026-08-30T14:22:01.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "a1b2c3d4e5f6...80charshex"
}
```

**Errores posibles:**

| Código | Motivo |
| ------ | ------ |
| 400 `VALIDATION_ERROR` | Email inválido, password menor a 8 caracteres, o falta algún campo requerido |
| 409 `CONFLICT` | Ya existe una cuenta registrada con ese email |

---

### POST /api/auth/login

**Autenticación:** No requiere

Autentica con email + password y devuelve un par de tokens nuevo.

**Body:**

```json
{
  "email": "juan@example.com",
  "password": "unaClaveSegura123"
}
```

**Respuesta exitosa (200):** mismo shape que `register` (`user`, `accessToken`, `refreshToken`).

**Errores posibles:**

| Código | Motivo |
| ------ | ------ |
| 400 `VALIDATION_ERROR` | Email inválido o falta el password |
| 401 `UNAUTHORIZED` | Email o contraseña incorrectos (la API no distingue cuál de los dos falló, por seguridad — el mensaje es siempre "Email o contraseña inválidos") |

---

### POST /api/auth/refresh

**Autenticación:** No requiere (usa el `refreshToken` en el body, no el header `Authorization`)

Rota el refresh token: revoca el usado y devuelve un par de tokens completamente nuevo. Usar cuando el access token expiró (401 en cualquier ruta protegida).

**Body:**

```json
{
  "refreshToken": "a1b2c3d4e5f6...80charshex"
}
```

**Respuesta exitosa (200):** mismo shape que `register`/`login` (`user`, `accessToken`, `refreshToken` — **ambos son nuevos**, hay que reemplazar los guardados por estos).

**Errores posibles:**

| Código | Motivo |
| ------ | ------ |
| 400 `VALIDATION_ERROR` | Falta `refreshToken` en el body |
| 401 `UNAUTHORIZED` | El refresh token no existe, ya expiró (30 días), ya fue revocado, o ya fue usado antes (rotación — reusar un token viejo es rechazado) |

---

### GET /api/users/me

**Autenticación:** Requiere Bearer token

Devuelve el perfil del usuario autenticado (a partir del token, no recibe parámetros).

**Respuesta exitosa (200):**

```json
{
  "id": "cly3x9f8h0000abc123",
  "email": "juan@example.com",
  "name": "Juan Pérez",
  "preferredUnit": "kg",
  "createdAt": "2026-08-30T14:22:01.000Z"
}
```

**Errores posibles:**

| Código | Motivo |
| ------ | ------ |
| 401 `UNAUTHORIZED` | Falta el header `Authorization`, o el access token es inválido/expiró |
| 404 `NOT_FOUND` | El usuario del token ya no existe (cuenta borrada) |

---

### PATCH /api/users/me

**Autenticación:** Requiere Bearer token

Actualiza la unidad de peso preferida del usuario (solo afecta cómo el cliente debería mostrar los pesos — los datos siempre se guardan en kg, ver [convenciones generales](/docs)).

**Body:**

```json
{
  "preferredUnit": "lb"
}
```

| Campo         | Tipo               | Requerido | Descripción |
| ------------- | ------------------ | --------- | ----------- |
| preferredUnit | `"kg"` \| `"lb"`   | sí        | Unidad de presentación preferida |

**Respuesta exitosa (200):** el `UserDTO` actualizado, mismo shape que `GET /users/me`.

**Errores posibles:**

| Código | Motivo |
| ------ | ------ |
| 400 `VALIDATION_ERROR` | `preferredUnit` ausente o con un valor distinto de `"kg"`/`"lb"` |
| 401 `UNAUTHORIZED` | Falta o es inválido el access token |
