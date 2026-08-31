# Entrenamientos (`/api/workouts`)

Registro de entrenamientos. **Todas las rutas de este módulo requieren Bearer token.**

Jerarquía de datos: una **sesión** (`WorkoutSession`) — solo puede haber una activa a la vez por usuario (`finishedAt: null`) — contiene **ejercicios de sesión** (`WorkoutExercise`, un ejercicio del catálogo agregado a esa sesión, con su `position` de orden), y cada uno contiene **series** (`WorkoutSet`).

**Regla importante — qué campo de la serie hay que llenar depende del `exerciseType` del ejercicio** (dato que viene en el catálogo, ver [ejercicios](/docs/ejercicios)):

| `exerciseType` | Campos relevantes | Motivo |
| --------------- | ------------------ | ------ |
| `weight_reps`, `bodyweight_reps`, `assisted_bodyweight` | `weightKg` + `reps` | Lo que importa es el volumen levantado |
| `duration`, `distance_duration` | `durationSeconds` | Lo que importa es el tiempo sostenido |

`restSeconds` (descanso tras la serie) es independiente y se puede mandar siempre, sin importar el tipo de ejercicio.

**El servidor valida esta combinación** al registrar la serie: si el `exerciseType` es `duration`/`distance_duration` exige `durationSeconds` y rechaza `weightKg`/`reps`; si es `weight_reps`/`bodyweight_reps`/`assisted_bodyweight` exige `reps` (`weightKg` es opcional — por ejemplo un ejercicio de peso corporal puede no tener peso) y rechaza `durationSeconds`. Mandar los campos equivocados para el tipo del ejercicio responde `400 VALIDATION_ERROR`.

**Ownership:** todas las rutas que reciben un `sessionId` o `workoutExerciseId` verifican que el recurso le pertenezca al usuario autenticado antes de operar sobre él (`404` si el recurso no existe, `403` si existe pero es de otro usuario). No alcanza con estar autenticado — hay que ser dueño del recurso.

---

### GET /api/workouts/sessions/active

**Autenticación:** Requiere Bearer token

Devuelve la sesión activa del usuario (si la hay), con sus ejercicios y series ya cargados. Útil al entrar a una pantalla de ejercicio para retomar progreso en vez de perderlo.

**Respuesta exitosa (200):** el objeto sesión, o `null` si no hay ninguna sesión activa.

```json
{
  "id": "clz1sess0000abc123",
  "startedAt": "2026-08-30T14:00:00.000Z",
  "finishedAt": null,
  "exercises": [
    {
      "id": "clz1wex0000abc123",
      "exerciseId": "cly3x9f8h0000abc123",
      "position": 1,
      "sets": [
        {
          "id": "clz1set0000abc123",
          "setNumber": 1,
          "weightKg": 60,
          "reps": 10,
          "durationSeconds": null,
          "restSeconds": 90,
          "createdAt": "2026-08-30T14:05:00.000Z"
        }
      ]
    }
  ]
}
```

**Errores posibles:**

| Código | Motivo |
| ------ | ------ |
| 401 `UNAUTHORIZED` | Falta o es inválido el access token |

---

### POST /api/workouts/sessions

**Autenticación:** Requiere Bearer token

Inicia una sesión de entrenamiento nueva. **Es idempotente en los datos, pero no en el status code**: si el usuario ya tiene una sesión activa, esta llamada devuelve esa misma sesión existente (no crea una segunda) — pero igual responde `201`, no `200`, incluso cuando no creó nada nuevo.

**Body:** ninguno.

**Respuesta exitosa (201):** mismo shape que `GET /sessions/active` (nunca `null` en este caso).

**Errores posibles:**

| Código | Motivo |
| ------ | ------ |
| 401 `UNAUTHORIZED` | Falta o es inválido el access token |

---

### POST /api/workouts/sessions/:sessionId/finish

**Autenticación:** Requiere Bearer token

Marca la sesión como terminada (`finishedAt` pasa a la fecha/hora actual). A partir de acá la sesión cuenta para las estadísticas del dashboard.

**Respuesta exitosa (200):** el objeto sesión con `finishedAt` seteado.

**Errores posibles:**

| Código | Motivo |
| ------ | ------ |
| 401 `UNAUTHORIZED` | Falta o es inválido el access token |
| 403 `FORBIDDEN` | La sesión existe pero pertenece a otro usuario |
| 404 `NOT_FOUND` | No existe una sesión con ese `sessionId` |

---

### POST /api/workouts/sessions/:sessionId/exercises

**Autenticación:** Requiere Bearer token

Agrega un ejercicio del catálogo a una sesión existente. La `position` se asigna automáticamente (siguiente orden disponible dentro de la sesión).

**Body:**

```json
{
  "exerciseId": "cly3x9f8h0000abc123"
}
```

| Campo      | Tipo   | Requerido | Descripción |
| ---------- | ------ | --------- | ----------- |
| exerciseId | string | sí        | `id` del ejercicio del catálogo (no el `slug`) |

**Respuesta exitosa (201):**

```json
{
  "id": "clz1wex0000abc123",
  "exerciseId": "cly3x9f8h0000abc123",
  "position": 1,
  "sets": []
}
```

**Errores posibles:**

| Código | Motivo |
| ------ | ------ |
| 400 `VALIDATION_ERROR` | Falta `exerciseId` en el body |
| 401 `UNAUTHORIZED` | Falta o es inválido el access token |
| 403 `FORBIDDEN` | La sesión existe pero pertenece a otro usuario |
| 404 `NOT_FOUND` | No existe una sesión con ese `sessionId` |

---

### POST /api/workouts/workout-exercises/:workoutExerciseId/sets

**Autenticación:** Requiere Bearer token

Registra una serie para un ejercicio dentro de una sesión. El `setNumber` se asigna automáticamente (siguiente número dentro de ese `workoutExerciseId`).

**Body** (qué campos son válidos depende del `exerciseType` del ejercicio — ver nota arriba de esta página):

```json
{
  "weightKg": 60,
  "reps": 10,
  "restSeconds": 90
}
```

| Campo           | Tipo   | Requerido | Descripción |
| --------------- | ------ | --------- | ----------- |
| weightKg        | number | no        | Positivo. Usar junto con `reps` para ejercicios de peso |
| reps            | number | no        | Entero positivo |
| durationSeconds | number | no        | Entero positivo. Usar para ejercicios de duración en vez de `weightKg`/`reps` |
| restSeconds     | number | no        | Entero, puede ser `0` |

Ejemplo para un ejercicio de tipo `duration`:

```json
{
  "durationSeconds": 45,
  "restSeconds": 60
}
```

**Respuesta exitosa (201):**

```json
{
  "id": "clz1set0000abc123",
  "setNumber": 1,
  "weightKg": 60,
  "reps": 10,
  "durationSeconds": null,
  "restSeconds": 90,
  "createdAt": "2026-08-30T14:05:00.000Z"
}
```

**Errores posibles:**

| Código | Motivo |
| ------ | ------ |
| 400 `VALIDATION_ERROR` | Algún campo tiene un valor negativo, cero (para los que exigen positivo), o no numérico; o el campo enviado no corresponde al `exerciseType` del ejercicio (ver nota arriba) |
| 401 `UNAUTHORIZED` | Falta o es inválido el access token |
| 403 `FORBIDDEN` | El ejercicio de sesión existe pero pertenece (vía su sesión) a otro usuario |
| 404 `NOT_FOUND` | No existe un `WorkoutExercise` con ese id dentro de ninguna sesión |

---

### GET /api/workouts/exercises/:exerciseId/last-set

**Autenticación:** Requiere Bearer token

Devuelve la última serie registrada por el usuario para ese ejercicio (en cualquier sesión, pasada o presente) — pensado para mostrar "última vez hiciste X kg × Y reps" antes de empezar una serie nueva.

**Respuesta exitosa (200):** el objeto serie (mismo shape que la respuesta de `POST .../sets`), o `null` si el usuario nunca registró una serie de ese ejercicio.

**Errores posibles:**

| Código | Motivo |
| ------ | ------ |
| 401 `UNAUTHORIZED` | Falta o es inválido el access token |

---

### GET /api/workouts/exercises/:exerciseId/history

**Autenticación:** Requiere Bearer token

Devuelve el historial de series del usuario para ese ejercicio, más reciente primero — pensado para armar un gráfico de progreso.

**Query params:**

| Nombre | Tipo   | Requerido | Descripción |
| ------ | ------ | --------- | ----------- |
| limit  | number | no        | Entero positivo, máximo `200`. Default `50` |

**Respuesta exitosa (200):**

```json
[
  {
    "setId": "clz1set0000abc123",
    "sessionId": "clz1sess0000abc123",
    "sessionStartedAt": "2026-08-30T14:00:00.000Z",
    "setNumber": 1,
    "weightKg": 60,
    "reps": 10,
    "durationSeconds": null
  }
]
```

Nota: a diferencia del resto de las respuestas de este módulo, cada entrada no incluye `restSeconds` ni `createdAt` propio de la serie — usar `sessionStartedAt` para ubicar temporalmente el punto en el gráfico.

**Errores posibles:**

| Código | Motivo |
| ------ | ------ |
| 400 `VALIDATION_ERROR` | `limit` no numérico, negativo, o mayor a 200 |
| 401 `UNAUTHORIZED` | Falta o es inválido el access token |

---

### GET /api/workouts/dashboard

**Autenticación:** Requiere Bearer token

Agrega estadísticas del usuario a partir de sus últimas 200 sesiones **terminadas** (sesiones sin `finishedAt` no cuentan para nada acá).

**Respuesta exitosa (200):**

```json
{
  "totalSessions": 42,
  "sessionsThisWeek": 3,
  "setsThisWeek": 27,
  "minutesThisWeek": 145,
  "currentStreakDays": 5,
  "recentSessions": [
    {
      "id": "clz1sess0000abc123",
      "startedAt": "2026-08-30T14:00:00.000Z",
      "finishedAt": "2026-08-30T15:10:00.000Z",
      "exerciseCount": 4,
      "setCount": 12,
      "durationMinutes": 70
    }
  ]
}
```

Notas de campos:

- `totalSessions` cuenta hasta las últimas 200 sesiones terminadas (no es un conteo histórico ilimitado).
- `sessionsThisWeek`/`setsThisWeek`/`minutesThisWeek` son de los últimos 7 días corridos, no "semana calendario".
- `currentStreakDays`: días consecutivos con al menos una sesión terminada. Si hoy todavía no se entrenó pero ayer sí, la racha se sigue contando como activa (no se rompe hasta que pase un día completo sin entrenar).
- `recentSessions` trae como máximo las 5 sesiones terminadas más recientes.

**Errores posibles:**

| Código | Motivo |
| ------ | ------ |
| 401 `UNAUTHORIZED` | Falta o es inválido el access token |
