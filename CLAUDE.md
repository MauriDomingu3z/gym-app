# Gym App — Arquitectura del proyecto

## Contexto

App de gimnasio con catálogo de ejercicios y gestión de usuarios. El catálogo (302 ejercicios, 3 frames PNG 512×512 c/u) se puebla desde el paquete npm `@bryllim/workout-guide` (assets bajo CC BY-SA 4.0 → atribución obligatoria a Everkinetic y Bryl Lim, visible en la app). La app está completamente en español: nombres de ejercicio, categorías (músculo/equipo/tipo) e instrucciones de ejecución — ver sección "Español (i18n)" más abajo.

Reglas de arquitectura no negociables:
- **Ionic no tiene lógica de negocio.** Es una capa de presentación pura: consume la API vía HTTP, no accede a datos directamente.
- **La API es la única fuente de verdad.** Persistencia en Postgres local vía Prisma (con migraciones).
- Framework Ionic: **Angular**. ORM/migraciones: **Prisma**.

**Español (i18n):** dos mecanismos distintos, a propósito:
- **Nombre del ejercicio** (`nameEs`): vive en la base de datos (columna en `Exercise`, poblada por el seed desde `api/prisma/seed/exerciseNameTranslations.ts` — diccionario estático de los 302 slugs). Es un dato del dominio, no presentación — por eso vive en la API, no en el frontend. `name` (inglés, del paquete original) se conserva y se sigue usando para la búsqueda junto a `nameEs` (`OR` en `prisma-exercise.repository.ts`). El listado ordena por `nameEs`, no por `name`.
- **Categorías** (músculo/equipo/tipo): son un conjunto cerrado de 41 valores — se traducen en el **frontend** (`ionic/src/app/shared/i18n/exercise-labels.ts`, `MUSCLE_LABELS`/`EQUIPMENT_LABELS`/`TYPE_LABELS` + `translateLabel()` con fallback al valor original). La API sigue filtrando y devolviendo estos valores en inglés (son las claves canónicas); el frontend solo los traduce para mostrar — nunca envía el label traducido como query param. Si el paquete de assets suma un valor nuevo en el futuro y no está en el diccionario, se muestra el valor en inglés como fallback (no rompe).
- Si se agrega un ejercicio nuevo al dataset upstream sin traducción en `exerciseNameTranslations.ts`, el seed cae en fallback al nombre en inglés — no falla, pero conviene completar la traducción.

**Instrucciones de ejecución** (`instructionsEs`, `String[]` en `Exercise`): el dataset original **no trae texto instructivo**, solo metadata + imágenes. Estos 3-4 pasos por ejercicio (302 entradas, cobertura verificada 100% contra el manifest real) los escribió Claude con conocimiento general de entrenamiento de fuerza — **no son contenido verificado por un profesional ni vienen de una fuente autoritativa**; están para dar una guía técnica razonable, no para reemplazar supervisión real. Viven en `api/prisma/seed/exerciseInstructionsEs.ts` (mismo patrón que `exerciseNameTranslations.ts`: diccionario slug → contenido, poblado por el seed, fallback a array vacío si falta un slug — no rompe el seed). Si se agrega un ejercicio nuevo al dataset, hay que sumar sus instrucciones a mano ahí. Se muestran en el detalle como lista numerada bajo "Cómo hacerlo".

## Comandos

- `npm run install:all` (raíz) — instala dependencias de `api/` e `ionic/` en un paso.
- `npm run dev` (raíz) — levanta **API + Ionic juntos** con `concurrently`, logs prefijados `[API]`/`[IONIC]`. `npm start` es alias de lo mismo.
- `npm run dev` (dentro de `api/`) — solo la API.
- `npm start` (dentro de `ionic/`) — solo Ionic (`ionic/` no tiene script `dev`, usa el nombre por defecto de Angular CLI).

## Backend (`api/`) — Arquitectura Hexagonal

El dominio no conoce Express ni Prisma. Cada módulo se organiza en 3 capas:

```
api/
  prisma/schema.prisma, migrations/, seed/{seedExercises,exerciseNameTranslations,exerciseInstructionsEs}.ts
  src/
    modules/
      exercises/
        domain/          # entidades + puertos (ExerciseRepository interface)
        application/     # use-cases (ListExercises, GetExerciseById) + DTOs
        infrastructure/  # PrismaExerciseRepository, controller, routes
      users/
        domain/          # entidad User + puertos (UserRepository, PasswordHasher, TokenService)
        application/     # RegisterUser, LoginUser, GetProfile
        infrastructure/  # PrismaUserRepository, Bcrypt/Jwt adapters, controller, routes
      shared/            # config (env validado), http (bootstrap, middlewares), errors
    server.ts
```

- `@prisma/client` se usa **solo** dentro de `infrastructure/*`; los use-cases dependen de interfaces (puertos), no de Prisma directamente → testeable sin DB.
- Seed idempotente (`prisma/seed/seedExercises.ts`): lee `manifest.json` de `@bryllim/workout-guide`, hace `upsert` en Postgres por `slug`, copia los PNG a `api/public/exercises/<slug>/frame-N.png` (servidos como estáticos en `/static/...`; solo se guarda el path en DB, nunca el binario).
- `equipment`, `primaryMuscle` y `exerciseType` son **`String` indexados, no enum de Postgres**: los valores vienen de un paquete npm externo que puede sumar nuevos valores en una futura versión, y un enum de Postgres exigiría una migración por cada valor nuevo. Se valida en la capa de aplicación, no en el schema.
- La atribución CC BY-SA se expone vía `GET /api/attribution` en vez de hardcodearse en el cliente.

**Config de entorno (Postgres):** el `.env` solo tiene `DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD` (convención reusada en otros proyectos) — **nunca una `DATABASE_URL` literal**. Tanto `src/shared/config/env.ts` (para el server) como `prisma.config.ts` (para el CLI de Prisma: migrate/generate/studio) arman la connection string en código a partir de esas variables. Si se agrega una nueva fuente de datos o servicio, seguir el mismo patrón — no volver a introducir `DATABASE_URL` a mano en el `.env`.

**Endpoints principales:**
- `GET /api/exercises` (filtros: muscle, equipment, type, search, paginación)
- `GET /api/exercises/:slug`
- `GET /api/exercises/filters`
- `GET /api/attribution`
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`
- `GET /api/users/me`

**Auth:** access token JWT stateless (15 min, firmado con `JWT_ACCESS_SECRET`). El **refresh token NO es JWT**: es un string random (`crypto.randomBytes`) del que solo se persiste el hash SHA-256 en la tabla `RefreshToken` (30 días, con `revokedAt`) — así se puede revocar/rotar sin depender de un segundo secreto. Cada uso de `/api/auth/refresh` rota el token (revoca el viejo, emite uno nuevo); reusar uno ya rotado devuelve 401. Password hashing con `bcryptjs` (no `bcrypt` nativo — evita compilar módulos nativos en Windows). El middleware de auth (`users/infrastructure/auth.middleware.ts`) solo valida el Bearer token y adjunta `req.userId`, sin lógica de negocio.

**Módulo `workouts` (registro de entrenamientos):** `WorkoutSession` (1 por usuario activa a la vez, `finishedAt: null` mientras dura) → `WorkoutExercise` (un ejercicio dentro de la sesión, `position` para orden) → `WorkoutSet` (una serie). **Qué campo se llena en `WorkoutSet` depende del `exerciseType` del `Exercise`** — decisión validada como "entrenador": para `weight_reps`/`bodyweight_reps`/`assisted_bodyweight` importa `weightKg`+`reps` (volumen = el indicador real de progreso); para `duration`/`distance_duration` importa `durationSeconds` (ahí sí el tiempo es el dato principal). `restSeconds` se guarda siempre, separado del tiempo de trabajo — nunca se mezclan.

Todas las rutas de `/api/workouts/*` están protegidas y además verifican **ownership**: cada use-case chequea que `session.userId`/`workoutExercise.session.userId` coincida con el usuario autenticado antes de tocar nada (`ForbiddenError` → 403 si no coincide, `NotFoundError` → 404 si no existe). No alcanza con el middleware de auth solo, porque cualquier usuario autenticado podría adivinar el id de la sesión de otro.

**Unidad de peso (kg/lb):** `User.preferredUnit` (`'kg' | 'lb'`, default `kg`) es solo de **presentación**. `WorkoutSet.weightKg` siempre se guarda en kg (unidad canónica) — la conversión vive en `ionic/src/app/shared/units/weight-unit.ts` (`kgToDisplayValue`/`displayValueToKg`), se aplica solo al mostrar/cargar. Cambiar de unidad nunca reescribe datos históricos ni rompe el gráfico de progreso (`GET /api/workouts/exercises/:exerciseId/history`).

Endpoints: `GET/POST /api/workouts/sessions(/active)`, `POST /api/workouts/sessions/:id/finish`, `POST /api/workouts/sessions/:id/exercises`, `POST /api/workouts/workout-exercises/:id/sets`, `GET /api/workouts/exercises/:exerciseId/{last-set,history}`, `GET /api/workouts/dashboard`. `PATCH /api/users/me` actualiza `preferredUnit`.

**`GET /api/workouts/dashboard`:** agrega `listFinishedSessionSummaries` (últimas 200 sesiones *terminadas*, con `_count` de sets por ejercicio vía Prisma — no trae el detalle completo de cada serie, solo lo necesario para contar) en el use-case `get-dashboard-summary.use-case.ts`: total histórico, sesiones/series/minutos de la última semana, y una **racha de días consecutivos** (`compute-streak.ts`, función pura). La racha usa el mismo criterio que Duolingo: si hoy todavía no entrenaste pero ayer sí, la racha sigue activa (no se rompe hasta que pase un día completo sin sesión) — evita que se vea "racha en 0" apenas el usuario abre la app a la mañana. `minutesThisWeek`/`durationMinutes` salen de `finishedAt - startedAt`, por eso solo cuentan sesiones ya finalizadas.

**Módulo `favorites`:** `Favorite` es la única tabla (`userId` + `exerciseId`, `@@unique` compuesto — Prisma genera la clave `userId_exerciseId` para el `where` de `upsert`/lookup). `addFavorite`/`removeFavorite` son **idempotentes a propósito** (`upsert` y `deleteMany` en vez de `create`/`delete`) — favoritear algo ya favorito, o sacar algo que ya no lo es, no es un error; esto simplifica mucho la UI (toggle optimista sin tener que sincronizar estado exacto antes de cada click). `listFavoriteExercises` devuelve `Exercise[]` completos (no solo ids) haciendo el join a nivel de infraestructura (`include: { exercise: true }` en Prisma) y reusando `toExerciseDTO` del módulo `exercises` — la respuesta de `GET /api/favorites` tiene el **mismo shape exacto** que `GET /api/exercises`, así el frontend reusa `ExerciseListComponent`/`ExerciseCardComponent` sin ningún adaptador. Endpoints: `GET/POST /api/favorites`, `DELETE /api/favorites/:exerciseId`, `GET /api/favorites/:exerciseId/status`.

**Menú del catálogo (rediseñado):** los botones "Progreso"/"Salir" sueltos en el header se reemplazaron por un solo ícono (`ellipsis-vertical`) que abre un `ActionSheetController` con "Progreso", "Favoritos", "Cerrar sesión", "Cancelar" — con 3+ destinos de navegación, seguir agregando botones de texto uno al lado del otro no escala en una pantalla de celular. El botón de favorito en sí (corazón) vive en el header de `exercise-detail.page`, con **update optimista**: cambia el ícono al instante del click y solo lo revierte si la request falla — no espera la respuesta del server para sentirse instantáneo.

## Frontend (`ionic/`) — Angular, cero lógica de negocio

```
ionic/src/app/
  core/
    services/       # auth.service (signals), exercises-api.service, attribution-api.service
    interceptors/   # auth.interceptor (Bearer token), error.interceptor
    guards/         # auth.guard
    models/         # interfaces TS = DTOs de la API
  shared/           # atomic design: atoms/molecules/organisms, 100% presentacional
  features/
    auth/           # login, register (páginas container)
    exercises/      # catálogo (filtros vía query params a la API), detalle
  app.routes.ts, app.config.ts
```

- Patrón container-presentational: solo las páginas (`*.page.ts`) inyectan servicios/HttpClient; los componentes de `shared/` reciben datos por `@Input()`.
- Estado con signals en servicios singleton (sin NgRx salvo que se justifique después).
- Filtrado/búsqueda de ejercicios se resuelve en la API vía query params, nunca en memoria del cliente.
- Reactive Forms para validación de formato (UX) está bien; las reglas de negocio reales las valida y responde la API.

**Versión y stack real:** **Angular 20** (no 22): el `Node` local es v24.11.1 y Angular CLI 22 exige ≥24.15.0 — el build falla, no es solo un warning. Si en el futuro se sube el Node local, recién ahí tiene sentido subir Angular. `@ionic/angular` es v9: el paquete raíz **ya es standalone** (`import { IonApp, IonRouterOutlet } from '@ionic/angular'`), y `provideIonicAngular` sale del subpath `@ionic/angular/provide` — **no existe** `@ionic/angular/standalone` en esta versión (eso era de Ionic 7/8).

**Sesión de auth:** `AuthService` (`core/services/auth/auth.service.ts`) guarda `accessToken`/`refreshToken`/`user` con `@capacitor/preferences` (no `localStorage` — funciona igual en web y en build nativo). Expone signals (`currentUser`, `isAuthenticated`) y un `whenReady()` para que el `authGuard` espere a que se restaure la sesión persistida antes de decidir. El `error.interceptor.ts` ya dispara `AuthService.refresh()` automáticamente ante un 401 (salvo en endpoints `/auth/*`) y reintenta la request original una vez.

**Páginas de auth (fase 5):** `features/auth/{login,register}` son containers finos; la UI real (Reactive Forms + validación de formato) vive en los organisms `shared/components/organisms/{login-form,register-form}`, que solo emiten `submitted` con los valores — la página decide qué hacer (llamar a `AuthService`, navegar, mostrar error). Rutas lazy (`loadComponent`) en `app.routes.ts`. Todo el flujo (guard sin sesión, registro, login, error de credenciales, logout) está probado con un smoke test real en Chromium (Playwright), no solo con `ng build`. El budget de bundle inicial en `angular.json` se subió de 500kB/1MB a 1MB/2MB — Ionic (web components de Stencil) infla el bundle base por encima del default pensado para Angular puro.

**Catálogo y detalle de ejercicios (fase 6):** `features/exercises/{exercise-catalog,exercise-detail}` reemplazan el placeholder `home` de la fase 5 (ya eliminado). El catálogo filtra por músculo/equipo/tipo y busca por nombre — **todo resuelto en la API vía query params** (`ExercisesApiService`), nunca filtrado en memoria del cliente. Molecules/organisms nuevos: `exercise-card`, `exercise-list`, `attribution-footer` — todos presentacionales puros, reciben datos por `input()`. Las imágenes de los ejercicios se arman como `environment.assetsOrigin + frame.path` (el backend las sirve en `/static/...`, en un origen distinto al del front en dev). El detalle muestra los 3 frames **fijos en fila** (`.exercise-frames`), no animados.

**UX de filtros (rediseñado):** mostrar los 3 grupos de chips siempre visibles (19 músculos + 17 equipos + 5 tipos = 41 chips) quedó descartado — dominaba la pantalla antes de llegar a ver un ejercicio. Se reemplazó `filter-chip-group` (eliminado) por: un botón "Filtros" con `ion-badge` (cantidad de filtros activos) que abre un `ion-modal` con 3 `ion-select` (interface popover, uno por categoría); y una fila de chips **solo con los filtros activos**, cada uno removible con un click. Patrón estándar de catálogos (filter sheet + active-filter chips) en vez de exponer todas las opciones de una. Nota de testing: Ionic no renderiza los `ion-select-option` declarados directamente en el popover — los usa como fuente de datos y genera su propio `ion-select-popover > ion-item/ion-radio`; para tests E2E hay que apuntar a `ion-popover ion-item`, no a `ion-select-option`.

**Cards del catálogo (rediseñadas):** se sacó el badge de `equipment` (ruido, esa info ya está en el detalle) y se movió el badge de `primaryMuscle` a superpuesto sobre la esquina de la imagen (semi-transparente) en vez de en fila debajo — menos altura por card, más limpio, patrón estándar de catálogos con miniaturas.

**Ya probado y descartado — no reintentar sin resolver esto primero:** ciclar los 3 frames rápido en un único `<ion-img>` para simular movimiento (tipo sprite animation). Se implementó (`exercise-frame-player`, luego eliminado) y se vio mal: los frames de `@bryllim/workout-guide` **no tienen un bounding box normalizado entre sí** — cada uno recorta el contenido a su propio tamaño dentro del canvas 512×512, así que al alternarlos la figura salta de escala y posición en vez de moverse fluido (confirmado inspeccionando visualmente los 3 frames por separado). El manifest tampoco trae coordenadas de bounding box para recentrar. Si se quiere retomar la idea, hay que resolver primero la normalización de cada PNG (recorte + recentrado del contenido no transparente, vía Canvas API u otra herramienta) — no alcanza con CSS (`object-fit` no ayuda: no sabe dónde está el sujeto dentro del PNG).

**Gotcha real de Ionic encontrado y corregido:** `ion-router-outlet` **mantiene las vistas anteriores montadas en el DOM** (stack completo, no las destruye) para soportar sus animaciones y el swipe-back nativo — a diferencia del `router-outlet` plano de Angular. Si después de login/registro se navega con `router.navigateByUrl(...)` sin más, la página de auth queda viva en ese stack indefinidamente. La corrección: **usar siempre `{ replaceUrl: true }`** al navegar tras login, registro y logout (ya aplicado en `login.page.ts`, `register.page.ts` y `exercise-catalog.page.ts`) — mantenerlo como convención para cualquier navegación futura que cierre un flujo de auth/sesión. Detectado con un smoke test en Chromium real, no lo hubiera mostrado `ng build` ni un test unitario.

**Tracker de entrenamiento en `exercise-detail.page`:** a diferencia del resto del front, esta lógica de estado (fases `idle`/`active`/`resting`, cronómetro, countdown de descanso) vive **directo en la página**, no en un shared component — es un widget específico de esta única pantalla, sin reuso real, así que partirlo en input/output solo agregaría indirección. El flujo, según `exerciseType`:
- `weight_reps`/`bodyweight_reps`/`assisted_bodyweight` → "Realizar ahora" muestra directo el form de peso+reps (sin cronómetro — el tiempo de la serie no se guarda, no es el dato relevante acá).
- `duration`/`distance_duration` → "Realizar ahora" arranca un cronómetro (`elapsedSeconds`, `setInterval` de 1s); "Terminar serie" lo detiene y ese valor es `durationSeconds`.
- Al terminar cualquier serie, arranca automático el descanso (90s fijo por ahora) con "Continuar" para saltarlo antes.
- Al cargar la página: pide `getLastSet` (para "Última vez…") y `getActiveSession` — si ya hay una sesión activa con este ejercicio agregado (el usuario navegó y volvió), retoma el `workoutExerciseId` y las series ya cargadas en vez de perder el progreso.
- Nota de testing: `ion-input` con `[label]` bindeado dinámicamente (property binding) **no queda reflejado como atributo HTML** — el label se ve perfecto en pantalla, pero un selector Playwright tipo `ion-input[label*="Peso"]` no lo encuentra. Para tests E2E, usar orden en el DOM (`.nth(0)`, `.nth(1)`) en vez de matchear por `label`.

**Bug real corregido — "Finalizar ejercicio" no hacía nada visible:** `finishExercise()` sí ejecutaba (reseteaba `workoutExerciseId` a `null`), pero la UI no cambiaba en absoluto — `loggedSets` seguía lleno, así que el bloque entero (series + el propio botón) se seguía viendo idéntico. Encima, resetear `workoutExerciseId` a `null` era un bug más serio: si el usuario volvía a tocar "iniciar", `startTracking()` creaba un **`WorkoutExercise` duplicado** en la misma sesión para el mismo ejercicio, en vez de reusar el existente. Corrección: separar el concepto en dos signals — `trackerPhase` (estado de UNA serie: idle/active/resting) y `exerciseDone` (boolean, "usuario terminó este ejercicio hoy") — y **nunca resetear `workoutExerciseId`** mientras la página esté montada; una vez resuelto (sesión + ejercicio agregado), se reusa siempre. `finishExercise()` ahora solo cambia `exerciseDone` a `true`, que muestra un resumen "✅ Ejercicio completado — N serie(s)" con un botón "Agregar otra serie" para reabrir (reusa el mismo id, no duplica). Lección: un botón que cambia estado interno sin ningún cambio visible en pantalla es indistinguible de un botón roto — cualquier acción de este tipo necesita feedback visible.

**Rediseño de intuitividad (a pedido):** "Finalizar entrenamiento" se movió del cuerpo de la página al header (`slot="end"`, color `danger`) — es una acción de **toda la sesión**, no de este ejercicio puntual, y estar al lado de "Finalizar ejercicio" generaba confusión sobre cuál hacía qué. Además ahora pide confirmación con `AlertController` antes de ejecutar (es la única acción irreversible del flujo). Verbos alineados en pares: "Iniciar serie" ↔ "Terminar serie", "Saltar descanso" (antes "Continuar", ambiguo) durante el descanso.

**Los PNG de `@bryllim/workout-guide` son trazo BLANCO sobre fondo transparente** (confirmado inspeccionando la paleta indexada del PNG: color 255,255,255 con alpha casi opaco) — están pensados para fondo oscuro, no para el fondo claro por defecto de `ion-card`. Por eso `exercise-card.component.scss` y `exercise-detail.page.scss` les ponen `background: #1c1c1e` al contenedor `ion-img`. **No sacar ese fondo oscuro** aunque parezca CSS "de más" — sin él las imágenes cargan perfectamente (200/304, `naturalWidth` correcto) pero son literalmente invisibles a simple vista. Si se agrega un componente nuevo que muestre frames de ejercicios, replicar el mismo fondo oscuro.

## Fases de implementación

1. ✅ Scaffold `api/`: Postgres + Prisma init, config validado, error-handling middleware, health-check.
2. ✅ Módulo `exercises`: schema Prisma, migración, seed desde `@bryllim/workout-guide`, use-cases + endpoints.
3. ✅ Módulo `users`/auth: modelo User + migración, hashing, JWT, register/login/me, middleware auth.
4. ✅ Scaffold `ionic/`: core (interceptors, guards, auth service), shared/atomic base, routing lazy.
5. ✅ Ionic — auth: páginas login/registro + guard sobre rutas protegidas.
6. ✅ Ionic — catálogo: páginas catálogo (filtros) + detalle + componente de atribución.
7. Post-MVP (pendiente): tests automatizados, CI (lint/test/build/migrate), despliegue, agregar plataforma nativa (`npx cap add android/ios`).

Hecho más allá del plan original (a pedido, post-fase-6):
- Comando único `npm run dev` en la raíz (`concurrently`) para levantar API + Ionic juntos.
- Rediseño de UX de filtros (modal + chips activos) y de las cards del catálogo.
- Localización completa a español: nombres de ejercicio (`nameEs`), categorías (diccionario frontend) e instrucciones de ejecución (`instructionsEs`).
- **Módulo `workouts`** (registro de entrenamientos): sesión → ejercicio → series, con peso/reps o duración según `exerciseType`, descanso auto-cronometrado, "última vez" de referencia, y `preferredUnit` (kg/lb) por usuario. Ver sección de arquitectura backend/frontend más arriba para el detalle.
- **Dashboard de estadísticas** (`/dashboard`, accesible desde el menú del catálogo): racha de días consecutivos, entrenamientos/series/minutos de la semana, total histórico, últimos 5 entrenamientos.
- **Módulo `favorites`**: favoritear/desfavoritear ejercicios (idempotente), lista de favoritos (`/favorites`), acceso desde el menú del catálogo (ícono `ellipsis-vertical` → action sheet).

## Archivos clave

- `api/prisma/schema.prisma` — modelos `Exercise`, `User`, `RefreshToken`, `WorkoutSession`, `WorkoutExercise`, `WorkoutSet`, `Favorite`.
- `api/prisma/seed/{seedExercises,exerciseNameTranslations,exerciseInstructionsEs}.ts` — seed + diccionarios de español.
- `api/src/modules/exercises/infrastructure/prisma-exercise.repository.ts`
- `api/src/modules/users/infrastructure/{jwt-token.service,composition}.ts`
- `api/src/modules/workouts/infrastructure/{prisma-workout.repository,workouts.routes}.ts`
- `api/src/modules/favorites/infrastructure/{prisma-favorite.repository,favorites.routes}.ts`
- `api/src/shared/http/app.ts` (bootstrap + rutas montadas) y `errorMiddleware.ts`
- `api/prisma.config.ts` — arma `DATABASE_URL` para el CLI de Prisma desde las variables `DB_*`.
- `ionic/src/app/core/interceptors/{auth,error}.interceptor.ts`
- `ionic/src/app/core/services/auth/auth.service.ts`
- `ionic/src/app/core/services/workouts/workouts-api.service.ts`
- `ionic/src/app/core/services/favorites/favorites-api.service.ts`
- `ionic/src/app/shared/i18n/exercise-labels.ts` — diccionario de categorías en español.
- `ionic/src/app/shared/units/weight-unit.ts` — conversión kg/lb (presentación, no negocio).
- `ionic/src/app/features/exercises/{exercise-catalog,exercise-detail}/*.page.ts`
- `ionic/src/app/features/dashboard/dashboard.page.ts`
- `ionic/src/app/features/favorites/favorites.page.ts`
- `api/src/modules/workouts/application/{get-dashboard-summary.use-case,compute-streak}.ts`
