# SPEC 08 — Maquetación de la pantalla «Correo enviado»

> **Status:** Draft
> **Depends on:** SPEC 03 (primitivos `bb-*`), SPEC 04 (layouts)
> **Date:** 2026-10-09
> **Objective:** Maquetar `/forgot-password/sent` componiendo primitivos `bb-*` dentro del shell de auth, con la cuenta regresiva de reenvío funcionando en local.

## Context

`src/app/features/auth/pages/forgot-password-sent/forgot-password-sent.ts` sigue siendo el `<h1>` de SPEC 02. Es el acuse de la pantalla anterior: confirma sin confirmar —«si ese correo está registrado…», la redacción anti-enumeración que documenta el `README.md` del kit— y le pone al usuario una espera de 45 segundos antes de poder reintentar.

Esa espera es lo único con estado de la pantalla, y es exactamente lo que no se puede dejar para después: un botón que dice «Reenviar correo en 00:45» y nunca llega a 00:00 es una maqueta rota, no una maqueta pendiente. No tiene formulario, así que es la única pantalla de auth con campos de texto que no depende de SPEC 05.

## Goals

1. `/forgot-password/sent` reproduce `screens/02b-correo-enviado.html` en escritorio y `referencia-diseno/MovilCorreoEnviado.dc.html` en móvil, sin hex ni `<svg>` escritos a mano.
2. La cuenta regresiva arranca en 00:45, baja un segundo por segundo, y al llegar a cero habilita el botón y cambia su texto a «Reenviar correo».
3. El temporizador se detiene al destruir el componente y no acumula desfase si la pestaña pasa a segundo plano.
4. El correo del usuario se muestra destacado dentro del párrafo, a partir de un `signal` con valor de maqueta y un punto de inyección marcado.
5. `/forgot-password/sent` pasa AXE sin violaciones.

## Non-goals

- **No** se reenvía ningún correo. El botón, una vez habilitado, reinicia su propia cuenta regresiva y deja un `TODO`; la llamada a `POST /auth/forgot-password` es del spec de autenticación.
- **No** se lee el correo de un _query param_ ni de ningún estado de navegación. Es un `signal` con el valor de la maqueta (decisión de alcance de esta tanda); conectarlo es del spec de autenticación.
- **No** se persiste la cuenta regresiva entre recargas ni entre pestañas. Recargar la vuelve a 45 segundos, y eso es correcto para una maqueta sin backend: el _cooldown_ real solo lo puede imponer el servidor.
- **No** se maqueta el panel de marca ni el contenedor: son de `auth-layout` (SPEC 04).
- **No** se toca `shared/ui/`, `features/auth/ui/`, `auth.routes.ts` ni ningún archivo fuera de la carpeta de esta página.
- **No** se promueve a primitivo la caja de dos avisos del requisito 5, aunque se parezca a `bb-note`: tiene un solo consumidor.

## Dependencies

- **SPEC 04.** El `<main>` centrado de 420 px y el contrato de landmarks: esta página no emite `<main>`, `<header>`, `<nav>` ni `<aside>`, y sí emite el único `<h1>`.
- **SPEC 03.** `bb-status-circle` (`icon`), `button[bb-button]` / `a[bb-button]` (`variant`, `disabled`) y `bb-icon`. Iconos del registro: `mail-check`, `clock`, `list`.
- **`@angular/core`.** `signal`, `computed` y `DestroyRef` para cerrar el intervalo. La app es _zoneless_, así que escribir un signal desde el `setInterval` basta para que la vista se actualice.
- **`@angular/router`.** `RouterLink` para «Volver al inicio de sesión».
- **`references/viaticos-bambu-kit/screens/02b-correo-enviado.html`, `auth.css` y `auth.js`** (el bloque `data-resend`) y **`referencia-diseno/MovilCorreoEnviado.dc.html`** (solo lectura).

## Functional requirements

1. El contenido es una columna con tres bloques: encabezado, caja de dos avisos, y el par de botones.
2. El encabezado es una columna con `gap-[18px]`: `<bb-status-circle icon="mail-check" />`, el `<h1>Revisa tu correo</h1>` a `text-bb-h2 font-bold leading-[1.15]` (28 px por debajo de `md:`), y el párrafo a `text-base leading-normal text-bb-text-muted` (15 px en móvil).
3. El párrafo es, textualmente: «Si **{correo}** está registrado en la plataforma, recibirás en unos minutos un enlace para restablecer tu contraseña.», con el correo interpolado desde un `signal` y marcado con `text-bb-text font-bold` — el `.strong` del kit.
4. Ese `signal` es privado, arranca en `'nombre@bambu-techservices.com'` y lleva un `TODO` de una línea que marca el punto de inyección del dato real.
5. La caja de avisos es un contenedor `bg-bb-surface border border-bb-border-subtle rounded-md p-5` en columna con `gap-3.5`, y dos filas de `gap-3`: `<bb-icon name="clock" [size]="20" />` con «El enlace vence en 30 minutos y solo puede usarse una vez.», y `<bb-icon name="list" [size]="20" />` con «¿No llega? Revisa tu carpeta de spam o correo no deseado.». Los iconos van en `text-bb-green` y los textos a `text-sm leading-normal text-bb-text-muted`. **No se usa `bb-note`**: su plantilla es una sola fila con un icono, y esta caja tiene dos; los valores son los mismos tokens, así que si una tercera pantalla pidiera esta variante, se promovería a primitivo entonces.
6. Los dos botones van en una columna con `gap-3.5`: primero `<a bb-button routerLink="/login">Volver al inicio de sesión</a>` en variante por defecto (`primary` / `lg` / `block`), y debajo `<button bb-button variant="secondary" type="button">` con la cuenta regresiva.
7. El botón secundario arranca deshabilitado con el texto «Reenviar correo en 00:45».
8. La cuenta regresiva se calcula contra una marca de tiempo objetivo fijada al construir el componente (`ahora + 45 s`), no restando uno a un contador: así, si el navegador estrangula el intervalo con la pestaña en segundo plano, al volver muestra el tiempo real y no uno retrasado.
9. El intervalo corre cada segundo y se cancela en el `DestroyRef` del componente. Cuando el tiempo restante llega a cero, el intervalo se detiene solo.
10. El texto del botón se deriva con `computed()` del tiempo restante: «Reenviar correo en 00:SS» con los segundos a dos dígitos mientras queda tiempo, y «Reenviar correo» en cuanto llega a cero, momento en el que el botón también se habilita.
11. Pulsar el botón habilitado reinicia la cuenta regresiva a 45 segundos y vuelve a deshabilitarlo, y deja un `TODO` de una línea donde irá la llamada real de reenvío.
12. La plantilla puede quedar inline si cabe cómoda; si pasa de unas 30 líneas, se mueve a `forgot-password-sent.html` junto al `.ts`, con ruta relativa.
13. El componente conserva su selector `app-forgot-password-sent`, su clase `ForgotPasswordSent` y su archivo `forgot-password-sent.ts`.

## Interfaces & contracts

N/A — la pantalla no exporta nada importable. Su clase solo la referencia el `loadComponent` ya declarado en `auth.routes.ts`, y no introduce rutas, assets, tokens ni chunks nuevos.

## Edge cases

- **Pestaña en segundo plano durante la espera.** El navegador puede estrangular `setInterval` a una vez por minuto. Como el cálculo es contra una marca de tiempo objetivo (requisito 8), al volver el botón muestra el tiempo real o ya está habilitado; no se queda «congelado» en 00:31.
- **Salir de la pantalla con la cuenta a medias.** El `DestroyRef` cancela el intervalo: no queda un temporizador escribiendo en un componente destruido.
- **Recargar la página.** La cuenta vuelve a 00:45. No se persiste: sin backend, cualquier persistencia sería una invención local que el servidor no respalda.
- **Reloj del sistema cambiado hacia atrás durante la espera.** El tiempo restante podría crecer. Se acota a un máximo de 45 segundos y a un mínimo de 0, para que el texto nunca muestre un valor fuera de rango.
- **La cuenta regresiva y los lectores de pantalla.** El texto del botón cambia cada segundo, pero **no** se marca como región viva: anunciar «44, 43, 42…» sería inusable. La consecuencia aceptada es que la habilitación no se anuncia sola; se descubre al volver al botón, que es como se comporta el kit.
- **Doble pulsación rápida del botón habilitado.** La primera lo deshabilita; la segunda no llega al manejador.
- **Correo muy largo en el párrafo.** Hace wrap dentro del párrafo, en negrita, sin truncar ni desbordar: los 420 px del contenedor son el límite.
- **Texto al 200 % y ancho de 320 px.** El círculo de estatus mide 64 px fijos (es un adorno); los dos botones conservan su alto mínimo y su texto hace wrap sin recortes ni scroll horizontal.
- **Concurrencia, dependencias caídas, timeouts, permisos.** N/A — la pantalla no hace I/O.

## Acceptance criteria

- [ ] Dado `/forgot-password/sent` a 1280 px, se ve, en orden: el círculo verde con el sobre marcado, «Revisa tu correo», el párrafo con el correo en negrita blanca, la caja con los dos avisos (reloj y lista) en iconos verdes, el botón verde «Volver al inicio de sesión» y, debajo, el botón secundario deshabilitado.
- [ ] Dado `/forgot-password/sent` a 390 px, el mismo contenido se alinea arriba bajo el logo del header móvil, el título baja a 28 px y no hay scroll horizontal.
- [ ] `document.querySelectorAll('h1')` devuelve exactamente un elemento, y es «Revisa tu correo».
- [ ] La página no contiene ningún `<main>`, `<header>`, `<nav>` ni `<aside>` propio.
- [ ] Dado el primer render, el botón secundario está deshabilitado y dice «Reenviar correo en 00:45»; a los 5 segundos dice «Reenviar correo en 00:40».
- [ ] Dados 45 segundos transcurridos, el botón dice «Reenviar correo», deja de estar deshabilitado y es alcanzable con teclado.
- [ ] Dado el botón ya habilitado, cuando se pulsa, vuelve a deshabilitarse y la cuenta reinicia en 00:45.
- [ ] Dado que se navega fuera de la pantalla antes de que termine la cuenta, no queda ningún intervalo activo (verificable con una prueba unitaria que destruya el fixture y avance el reloj falso sin que el componente escriba).
- [ ] «Volver al inicio de sesión» lleva a `/login` y el `title` del documento cambia a «Iniciar sesión».
- [ ] AXE sobre `/forgot-password/sent` reporta 0 violaciones.
- [ ] Comparada contra `screens/02b-correo-enviado.html` lado a lado, no hay diferencias de espaciado, tamaño de fuente ni color en ninguno de los dos breakpoints.
- [ ] `pnpm build` sigue listando el chunk `forgot-password-sent`, `pnpm test` termina sin errores y `npx prettier --check` sobre los archivos tocados pasa.
- [ ] `git diff --name-only` solo toca `src/app/features/auth/pages/forgot-password-sent/**` y este spec.

## Risks

- **Es la única pantalla de la tanda con un temporizador.** Un intervalo sin cancelar sobrevive a la navegación y escribe sobre un componente destruido; en _zoneless_ eso no rompe la vista, pero sí deja trabajo huérfano y hace que las pruebas con reloj falso se contaminen entre sí. La mitigación es el criterio de aceptación que lo prueba explícitamente, no la revisión a ojo.
