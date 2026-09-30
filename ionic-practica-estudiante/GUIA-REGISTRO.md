# Guía paso a paso: implementar el registro de usuario

Esta guía es para completar lo que falta en este proyecto: conectar el formulario de registro (que ya existe) con la API real. El objetivo no es solo "que funcione", sino que cada paso quede justificado por lo que dice la documentación del API — no por prueba y error.

## Punto de partida: qué ya existe

Antes de escribir una sola línea, recorré estos archivos para entender con qué se trabaja:

- `src/app/features/register/register.page.ts` — la página, con un formulario reactivo (`email`, `password`, `name`) ya validado, y un método `onSubmit()` con un bloque de comentarios `TODO` donde debería ir la llamada a la API.
- `src/app/features/register/register.page.html` — el template: inputs conectados al form, un botón de submit, y un párrafo que muestra `errorMessage()` si algo sale mal.
- `src/app/core/models/auth.model.ts` — las interfaces TypeScript (`RegisterPayload`, `UserDTO`, `AuthResult`).
- `src/app/environments/environment.ts` — tiene `apiUrl`, la base de todas las URLs del API.
- `src/app/app.config.ts` — ya tiene `provideHttpClient()`, así que `HttpClient` se puede inyectar en cualquier servicio sin configurar nada más.

Lo que falta: el archivo `core/services/auth.service.ts` (no existe) y la llamada real dentro de `onSubmit()`.

---

## Paso 1 — Leer la documentación ANTES de tocar código

Esto es lo más importante de toda la guía: **no se adivina el contrato de una API, se lee.**

La documentación real de este backend está publicada en:

```
https://gymapi.gemaclass.com/docs
```

Abrí esa URL en el navegador. Vas a ver un índice con enlaces a cada módulo (Autenticación, Ejercicios, Entrenamientos, Favoritos). Para este ejercicio entrá específicamente a:

```
https://gymapi.gemaclass.com/docs/autenticacion
```

Ahí buscá la sección **`POST /api/auth/register`** y contestate estas preguntas leyendo la doc (no la guía, la doc):

1. ¿Requiere autenticación? (la respuesta está literal en la página)
2. ¿Qué campos lleva el `body` y cuáles son obligatorios?
3. ¿Qué te devuelve si sale bien? ¿Con qué código HTTP?
4. ¿Qué te puede devolver si sale mal? ¿Qué códigos y en qué casos?

No sigas al paso 2 hasta poder responder las cuatro sin volver a mirar.

**Además**, en `https://gymapi.gemaclass.com/docs` (el índice) hay dos secciones clave para cualquier endpoint, no solo este:

- **Base URL** — de ahí sale el valor que ya está cargado en `environment.ts`. Confirmá que coincide.
- **Formato estándar de error** — todos los errores del API devuelven `{ error: { code, message } }`. Vas a necesitar esto en el paso 6.

---

## Paso 2 — Confirmar la base URL en el proyecto

Abrí `src/environments/environment.ts` y verificá que `apiUrl` sea exactamente el que la documentación indica como Base URL. Si en algún momento cambia el servidor, este es el único lugar que se toca — por eso existe, en vez de escribir la URL completa en cada llamada.

---

## Paso 3 — Probar el endpoint fuera de Angular (antes de escribir el servicio)

Con Postman, Thunder Client, Insomnia o `curl`, hacé el `POST` que describe la documentación, contra la URL real:

```
POST https://gymapi.gemaclass.com/api/auth/register
Content-Type: application/json

{
  "email": "tuprueba@example.com",
  "password": "unaClaveSegura123",
  "name": "Nombre de Prueba"
}
```

¿Por qué antes de tocar Angular? Porque si algo falla más adelante, necesitás poder separar dos problemas distintos: "el API no me responde lo que esperaba" vs. "mi código Angular está mal escrito". Si ya viste la respuesta cruda acá, sabés exactamente contra qué comparar cuando lo veas fallar (o funcionar) desde la app.

Guardá mentalmente (o en un bloc de notas) la respuesta exacta que te devolvió — la vas a comparar con `auth.model.ts` en el paso siguiente.

---

## Paso 4 — Verificar que el modelo TypeScript coincide con el contrato

Abrí `src/app/core/models/auth.model.ts`. Compará campo por campo contra:

- lo que pide la documentación en el `body` de `register` → `RegisterPayload`
- lo que devuelve en la respuesta exitosa → `AuthResult` (que contiene `UserDTO`)

Si notás una diferencia entre lo que la doc dice y lo que está tipado acá, es señal de alerta — pará y fijate si la doc cambió o si el modelo tiene un error. El modelo TypeScript no es una sugerencia, tiene que calzar exacto con el contrato real.

---

## Paso 5 — Crear el servicio

Creá el archivo `src/app/core/services/auth.service.ts`. Este servicio es la **única** parte de la app que sabe que existe un `HttpClient` y una URL de API — la página nunca debería llamar a `HttpClient` directamente.

Guiate por esta estructura (completá vos la implementación, no la copies sin entender cada línea):

```ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthResult, RegisterPayload } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  register(payload: RegisterPayload): Observable<AuthResult> {
    // ¿Qué verbo HTTP dice la documentación que es? ¿Qué URL exacta?
    // Pista: environment.apiUrl + la ruta que viste en el paso 1.
  }
}
```

Preguntas para resolver antes de completar el método (todas se responden releyendo la doc del paso 1):

- ¿La URL completa es `environment.apiUrl + '/auth/register'` o hay que armarla distinto?
- `HttpClient.post<T>()` — ¿qué es `T` acá? ¿Qué tipo espera devolver la promesa/observable?
- ¿El `payload` que recibe el método coincide exactamente con lo que la doc pide en el `body`?

---

## Paso 6 — Conectar el servicio en la página

En `register.page.ts`, donde está el bloque `TODO`, seguí los 3 pasos que ya están comentados ahí:

1. Inyectar el servicio.
2. Llamar a `register()` con los valores del formulario.
3. Suscribirse (`.subscribe({ next, error })`).

Pensá qué hace cada rama:

- **`next`** — se ejecuta si el API respondió con éxito (según la doc, código `201`). Acá es donde, más adelante, iría la navegación a la siguiente pantalla (por ejemplo un dashboard) — por ahora, con un `console.log()` del resultado alcanza para verificar que llega lo que la doc prometía.
- **`error`** — se ejecuta si el API respondió con un error. Fijate en la tabla de errores de la documentación (`400 VALIDATION_ERROR`, `409 CONFLICT`): el flujo se queda en esta misma pantalla, no se redirecciona a ningún lado, porque el usuario tiene que poder corregir el formulario y reintentar.

---

## Paso 7 — Probar desde el navegador y comparar con la doc

Con la API real ya configurada en `environment.ts`, corré la app (`npm start`) y completá el formulario.

Abrí las herramientas de desarrollador del navegador → pestaña **Network** → buscá el request a `/auth/register` y revisá:

- ¿El método y la URL son los que decía la documentación?
- ¿El status code coincide? (`201` si salió bien)
- ¿El body de la respuesta tiene la misma forma que viste en el paso 3?

Si mandás un email que ya usaste antes, deberías ver un `409` con `code: "CONFLICT"` — es el comportamiento que la documentación describe, no un bug.

---

## Lo que a propósito NO hay que hacer todavía

- No guardes el `accessToken`/`refreshToken` en ningún lado persistente (eso es contenido de más adelante en el curso).
- No implementes login todavía.
- No navegues de verdad a otra pantalla al terminar — dejá el comentario tal cual está. Cuando exista una pantalla de destino real, ahí se agrega la navegación.

La idea de esta práctica es una sola cosa bien hecha: leer un contrato documentado y conectar un formulario a un endpoint real, verificando cada paso contra la documentación en vez de contra lo que "parece que debería funcionar".
