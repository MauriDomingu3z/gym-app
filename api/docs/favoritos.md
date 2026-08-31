# Favoritos (`/api/favorites`)

Marcar/desmarcar ejercicios como favoritos. **Todas las rutas de este módulo requieren Bearer token.**

Las operaciones de agregar y quitar son **idempotentes a propósito**: favoritear algo que ya es favorito, o desfavoritear algo que ya no lo era, no es un error — simplifica implementar un toggle en el cliente sin tener que sincronizar el estado exacto antes de cada click.

---

### GET /api/favorites

**Autenticación:** Requiere Bearer token

Lista los ejercicios favoritos del usuario autenticado. La respuesta trae los **ejercicios completos**, no solo sus ids — tiene el mismo shape exacto que `GET /api/exercises` (el array de `items`), pensado para poder reusar en el cliente el mismo componente de listado que usa el catálogo.

**Respuesta exitosa (200):**

```json
[
  {
    "id": "cly3x9f8h0000abc123",
    "slug": "barbell-bench-press",
    "name": "Barbell Bench Press",
    "nameEs": "Press de banca con barra",
    "instructionsEs": ["..."],
    "exerciseType": "weight_reps",
    "equipment": "barbell",
    "primaryMuscle": "chest",
    "secondaryMuscles": ["triceps", "shoulders"],
    "isStretch": false,
    "frames": ["/static/exercises/barbell-bench-press/frame-1.png"],
    "defaultRestSeconds": 90
  }
]
```

Ver [ejercicios](/docs/ejercicios) para el detalle completo de cada campo.

**Errores posibles:**

| Código | Motivo |
| ------ | ------ |
| 401 `UNAUTHORIZED` | Falta o es inválido el access token |

---

### POST /api/favorites

**Autenticación:** Requiere Bearer token

Marca un ejercicio como favorito. Idempotente: si ya era favorito, no falla ni duplica — simplemente confirma el estado.

**Body:**

```json
{
  "exerciseId": "cly3x9f8h0000abc123"
}
```

| Campo      | Tipo   | Requerido | Descripción |
| ---------- | ------ | --------- | ----------- |
| exerciseId | string | sí        | `id` del ejercicio del catálogo (no el `slug`) |

**Respuesta exitosa (201):** sin body (respuesta vacía).

**Errores posibles:**

| Código | Motivo |
| ------ | ------ |
| 400 `VALIDATION_ERROR` | Falta `exerciseId` en el body |
| 401 `UNAUTHORIZED` | Falta o es inválido el access token |

---

### DELETE /api/favorites/:exerciseId

**Autenticación:** Requiere Bearer token

Quita un ejercicio de favoritos. Idempotente: si no era favorito, no falla — simplemente confirma el estado.

**Respuesta exitosa (204):** sin body (respuesta vacía).

**Errores posibles:**

| Código | Motivo |
| ------ | ------ |
| 401 `UNAUTHORIZED` | Falta o es inválido el access token |

---

### GET /api/favorites/:exerciseId/status

**Autenticación:** Requiere Bearer token

Consulta si un ejercicio puntual es favorito del usuario autenticado — pensado para pintar el ícono de corazón en la pantalla de detalle de un ejercicio sin tener que traer la lista completa de favoritos.

**Respuesta exitosa (200):**

```json
{
  "isFavorite": true
}
```

**Errores posibles:**

| Código | Motivo |
| ------ | ------ |
| 401 `UNAUTHORIZED` | Falta o es inválido el access token |
