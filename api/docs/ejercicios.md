# Ejercicios (`/api/exercises`)

Catálogo de ejercicios. **Todas las rutas de este módulo requieren Bearer token** (a diferencia de lo que se podría suponer de un catálogo público) — hay que estar autenticado incluso para listar o ver el detalle de un ejercicio.

---

### GET /api/exercises

**Autenticación:** Requiere Bearer token

Lista ejercicios con filtros opcionales y paginación. El filtrado y la búsqueda se resuelven enteramente en el servidor — no hace falta (ni conviene) traer todo el catálogo y filtrar en el cliente.

**Query params:**

| Nombre     | Tipo   | Requerido | Descripción |
| ---------- | ------ | --------- | ----------- |
| muscle     | string | no        | Filtra por músculo primario **o** secundario (valor canónico en inglés, ej. `"chest"`) |
| equipment  | string | no        | Filtra por equipo (valor canónico en inglés, ej. `"barbell"`) |
| type       | string | no        | Filtra por `exerciseType` (ej. `"weight_reps"`) |
| search     | string | no        | Búsqueda de texto libre contra el nombre (busca en `name` inglés **y** `nameEs`, insensible a mayúsculas) |
| page       | number | no        | Página, entero positivo. Default `1` |
| limit      | number | no        | Resultados por página, entero positivo. Default `20`, máximo `100` |

Ejemplo: `GET /api/exercises?muscle=chest&type=weight_reps&search=press&page=1&limit=20`

**Respuesta exitosa (200):**

```json
{
  "items": [
    {
      "id": "cly3x9f8h0000abc123",
      "slug": "barbell-bench-press",
      "name": "Barbell Bench Press",
      "nameEs": "Press de banca con barra",
      "instructionsEs": [
        "Acostate en el banco con los pies apoyados en el piso.",
        "Bajá la barra de forma controlada hasta el pecho.",
        "Empujá la barra hacia arriba hasta extender los brazos."
      ],
      "exerciseType": "weight_reps",
      "equipment": "barbell",
      "primaryMuscle": "chest",
      "secondaryMuscles": ["triceps", "shoulders"],
      "isStretch": false,
      "frames": [
        "/static/exercises/barbell-bench-press/frame-1.png",
        "/static/exercises/barbell-bench-press/frame-2.png",
        "/static/exercises/barbell-bench-press/frame-3.png"
      ],
      "defaultRestSeconds": 90
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

Notas de campos:

- `name` es el nombre original en inglés (del dataset upstream); `nameEs` es la traducción y es la que conviene mostrar en UI.
- `exerciseType` es uno de: `weight_reps`, `bodyweight_reps`, `assisted_bodyweight`, `duration`, `distance_duration` — de este valor depende qué campos hay que loggear al registrar una serie (ver [entrenamientos](/docs/entrenamientos)).
- `frames` son paths relativos servidos como estáticos — hay que anteponerles el origen del host (sin `/api`) para armar la URL completa de la imagen (ver [convenciones generales](/docs)).
- `defaultRestSeconds` es el descanso sugerido en segundos tras completar una serie de este ejercicio.
- `secondaryMuscles` puede ser un array vacío.

**Errores posibles:**

| Código | Motivo |
| ------ | ------ |
| 400 `VALIDATION_ERROR` | `page`/`limit` no numéricos o negativos, o `limit` mayor a 100 |
| 401 `UNAUTHORIZED` | Falta o es inválido el access token |

---

### GET /api/exercises/:slug

**Autenticación:** Requiere Bearer token

Devuelve el detalle de un ejercicio por su `slug` (identificador legible, ej. `"barbell-bench-press"`, no el `id`).

**Respuesta exitosa (200):** mismo shape que un elemento de `items` en `GET /exercises` (ver ejemplo arriba).

**Errores posibles:**

| Código | Motivo |
| ------ | ------ |
| 401 `UNAUTHORIZED` | Falta o es inválido el access token |
| 404 `NOT_FOUND` | No existe ningún ejercicio con ese slug |

---

### GET /api/exercises/filters

**Autenticación:** Requiere Bearer token

Devuelve los valores canónicos disponibles para armar los filtros de la UI (por ejemplo, para poblar selects de músculo/equipo/tipo) — son los valores reales presentes en la base, ya ordenados alfabéticamente, **en inglés** (ver [convenciones generales](/docs) sobre traducción a cargo del cliente).

**Respuesta exitosa (200):**

```json
{
  "equipment": ["barbell", "bodyweight", "cable", "dumbbell"],
  "muscles": ["biceps", "chest", "glutes", "quadriceps"],
  "types": ["assisted_bodyweight", "bodyweight_reps", "distance_duration", "duration", "weight_reps"]
}
```

**Errores posibles:**

| Código | Motivo |
| ------ | ------ |
| 401 `UNAUTHORIZED` | Falta o es inválido el access token |

---

### GET /api/attribution

**Autenticación:** No requiere

Devuelve los datos de atribución obligatoria de las imágenes de ejercicios (licencia CC BY-SA 4.0). No está bajo `/api/exercises` sino montado directo en la raíz de la API (`/api/attribution`). **Cualquier cliente que muestre imágenes de ejercicios debe exhibir esta información en su UI** — es un requisito de la licencia, no un detalle opcional.

**Respuesta exitosa (200):**

```json
{
  "creator": "Bryl Lim",
  "creatorUrl": "https://bryllim.com",
  "source": "Everkinetic",
  "sourceUrl": "https://github.com/everkinetic/data",
  "license": "CC BY-SA 4.0",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
  "notice": "Ilustraciones de ejercicios basadas en el trabajo de Everkinetic, adaptadas por Bryl Lim."
}
```

**Errores posibles:** ninguno esperado — endpoint estático, sin parámetros ni autenticación.
