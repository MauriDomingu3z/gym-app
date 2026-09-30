
# Plan de curso — Programación de Dispositivos Móviles

13 semanas. API ya construida (Gym App) entregada solo como documentación (`/docs`); los estudiantes arman el cliente Ionic/Angular a partir del contrato, no del código fuente. Cortes fijos: examen S6, presentación S12, examen final S13 — sin avance de contenido en esas tres semanas.

## Semana 1 — Arranque (liviano)

- Presentación del curso, objetivos, evaluación, calendario.
- Concepto: arquitectura cliente-servidor, por qué se entrega un API ya hecho.
- Setup: Node, Ionic CLI, Android Studio, Git.
- Entregable: proyecto Ionic en blanco corriendo, primer commit. Se reparte la doc del API.

## Bloque 1 — Fundamentos (S2-S5)

**S2 — HTTP y el contrato de la API**
- REST, verbos HTTP, códigos de estado, JSON.
- HttpClient, servicios, inyección de dependencias.
- La doc como contrato, no sugerencia.
- Entregable: primera pantalla consumiendo un endpoint real.

**S3 — Arquitectura del cliente**
- Standalone components, atomic design, container-presentational.
- Routing, lazy loading, modelos TS como DTOs.
- Filtros/paginación resueltos en la API, nunca en memoria.
- Entregable: catálogo con filtros y paginación reales.

**S4 — Autenticación: conceptos**
- Autenticación vs autorización. JWT y por qué es stateless.
- Header `Authorization: Bearer`. Access token vs refresh token.
- Entregable: login/registro con Reactive Forms.

**S5 — Sesión y rutas protegidas**
- Persistencia de tokens en dispositivo (no localStorage).
- Interceptores HTTP (adjuntar token, manejar 401, refrescar).
- Guards de ruta.
- Entregable: flujo login → catálogo protegido → logout.

**S6 — Examen parcial 1** (cubre S2-S5, sin contenido nuevo)

## Bloque 2 — Estado, calidad, publicación (S7-S11)

**S7 — CRUD, idempotencia y errores**
- CRUD sobre favoritos. Idempotencia.
- Formato estándar de error del API. UI optimista.
- Entregable: módulo de favoritos completo.

**S8 — Estado complejo sin romper la arquitectura**
- Máquinas de estado simples en la UI (idle/activo/descanso) sin meter lógica de negocio.
- Datos anidados de la API (sesión → ejercicio → serie). Signals.
- Entregable: registro de series de entrenamiento.

**S9 — UX de datos: filtros, unidades, dashboard**
- Patrones de filtro (modal + chips). Conversión de presentación (kg/lb) vs regla de negocio.
- Consumir estadísticas ya agregadas por el servidor.
- Entregable: pantalla de estadísticas + selector de unidad.

**S10 — Calidad: tests y revisión**
- Unit vs E2E. Un test E2E sobre el flujo crítico (login).
- Estados de carga/vacío/error. Code review entre compañeros.
- Entregable: primer test automatizado del proyecto.

**S11 — Empaquetado nativo y Play Store**
- Capacitor: de web a nativo. Build firmado (keystore, ícono, splash, permisos).
- Play Console: pista de pruebas internas (sin revisión) como objetivo realista del curso — la producción con revisión no entra en el calendario.
- Entregable: APK/AAB firmado, app en pista de pruebas internas.

**S12 — Presentación de proyecto** (demo + link de pruebas internas, sin contenido nuevo)

**S13 — Examen final** (cubre S7-S11, sin contenido nuevo)
