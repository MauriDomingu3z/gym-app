# Gym App API — Documentación

API REST para una app de gimnasio: catálogo de ejercicios, autenticación de usuarios, registro de entrenamientos y favoritos. Esta documentación describe únicamente el **contrato HTTP** (rutas, autenticación, formatos de request/response y errores) — no incluye detalles de implementación interna del servidor.

## Índice

- [Autenticación](/docs/autenticacion) — registro, login, refresh de tokens, perfil.
- [Ejercicios](/docs/ejercicios) — catálogo de ejercicios, filtros, atribución.
- [Entrenamientos](/docs/entrenamientos) — sesiones, series, historial, dashboard.
- [Favoritos](/docs/favoritos) — marcar/desmarcar ejercicios favoritos.

## Base URL

En producción:

```
https://gymapi.gemaclass.com/api
```

Todas las rutas descritas en esta documentación son relativas a esa base (por ejemplo, `GET /exercises` significa `GET https://gymapi.gemaclass.com/api/exercises`).

Los archivos estáticos (imágenes de ejercicios) **no** están bajo `/api` — se sirven directo desde la raíz del mismo host, bajo `/static/...` (por ejemplo `https://gymapi.gemaclass.com/static/exercises/squat/frame-1.png`). Los campos `frames` que devuelve la API son paths relativos (`/static/exercises/...`); hay que anteponerles el origen del host (sin `/api`) para armar la URL completa de la imagen.

En un entorno local de desarrollo, la API corre por defecto en `http://localhost:3000`, y la base sería `http://localhost:3000/api` (el puerto se controla con la variable de entorno `PORT`).

## Autenticación — flujo general

La autenticación es **stateless con JWT + refresh token rotante**. El flujo completo:

1. El cliente se registra (`POST /auth/register`) o inicia sesión (`POST /auth/login`).
2. La respuesta incluye un **access token** (JWT, válido 15 minutos) y un **refresh token** (string random, válido 30 días).
3. Todas las rutas protegidas exigen el access token en el header:

   ```
   Authorization: Bearer <accessToken>
   ```

4. Cuando el access token expira (o es inválido), la ruta protegida responde `401 UNAUTHORIZED`. El cliente debe entonces llamar a `POST /auth/refresh` mandando el `refreshToken` guardado, para obtener un **par nuevo** de tokens (access + refresh).
5. **El refresh token es de un solo uso**: cada llamada a `/auth/refresh` revoca el token usado y emite uno nuevo (rotación). Si se intenta reusar un refresh token ya rotado o revocado, la API responde `401 UNAUTHORIZED`. Hay que guardar siempre el `refreshToken` más reciente devuelto.
6. El access token **no se puede refrescar a sí mismo** ni se puede invalidar manualmente antes de que expire (no hay endpoint de logout server-side) — el "logout" en el cliente consiste en simplemente descartar los tokens guardados localmente.

**Importante:** casi todos los endpoints de este API requieren el header `Authorization: Bearer <accessToken>`, incluyendo el catálogo de ejercicios (`/exercises`). Las únicas rutas públicas (sin autenticación) son `GET /api/health`, `GET /api/attribution`, y las propias `POST /api/auth/register` / `POST /api/auth/login` / `POST /api/auth/refresh`.

## Formato estándar de error

Cualquier error (validación, autenticación, recurso no encontrado, etc.) devuelve un JSON con esta forma exacta:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email inválido"
  }
}
```

Códigos de error posibles y su status HTTP:

| HTTP | `code`             | Cuándo ocurre |
| ---- | ------------------ | ------------- |
| 400  | `VALIDATION_ERROR`  | El body o los query params no cumplen el schema esperado (falta un campo requerido, tipo incorrecto, etc.) |
| 401  | `UNAUTHORIZED`      | Falta el header `Authorization`, el token es inválido/expiró, credenciales de login incorrectas, o refresh token inválido/expirado/ya usado |
| 403  | `FORBIDDEN`         | El usuario autenticado intenta acceder a un recurso (sesión de entrenamiento, ejercicio de sesión) que pertenece a otro usuario |
| 404  | `NOT_FOUND`         | El recurso solicitado no existe (ejercicio por slug, sesión, etc.) |
| 409  | `CONFLICT`          | Se intenta registrar un email que ya existe |
| 500  | `INTERNAL_ERROR`    | Error inesperado del servidor |

## Convenciones generales

- **Content-Type:** todos los bodies de request/response son JSON (`application/json`).
- **Paginación:** el listado de ejercicios (`GET /exercises`) pagina con query params `page` (default `1`) y `limit` (default `20`, máximo `100`). La respuesta incluye `items`, `total` (cantidad total de resultados que matchean el filtro, sin paginar), `page` y `limit` — el cliente calcula la cantidad de páginas si la necesita (`Math.ceil(total / limit)`).
- **Categorías de ejercicio en inglés:** `muscle`, `equipment` y `type` son valores canónicos **en inglés** (por ejemplo `"chest"`, `"barbell"`, `"weight_reps"`) — así se guardan en la base y así hay que mandarlos como query param al filtrar. La traducción a español es responsabilidad del cliente que consuma esta API; el server nunca traduce ni acepta el valor traducido como filtro.
- **Unidad de peso:** todo peso (`weightKg`) se persiste y se devuelve siempre en **kilogramos**, sin importar qué unidad prefiera mostrar el cliente. Si el cliente quiere mostrar libras, la conversión es responsabilidad suya — la API no tiene ni expone un modo "lb" de almacenamiento.
- **Atribución obligatoria:** las imágenes de ejercicios provienen de Everkinetic (adaptadas por Bryl Lim) bajo licencia **CC BY-SA 4.0**, que exige atribución visible. Cualquier cliente que consuma `GET /api/attribution` y muestre las imágenes de ejercicios **debe mostrar esa atribución en la UI** (nombre del autor, fuente, licencia) — no es opcional decorativo, es un requisito de la licencia.
- **IDs:** todos los IDs (`id`, `exerciseId`, `sessionId`, etc.) son strings tipo `cuid` (por ejemplo `"cly3x9f8h0000abc123"`), no números incrementales.
- **Fechas:** todos los campos de fecha (`createdAt`, `startedAt`, `finishedAt`, etc.) se serializan como strings ISO 8601 en el JSON de respuesta (por ejemplo `"2026-08-30T14:22:01.000Z"`).
