# SPEC 07 — Maquetación de la pantalla «Olvidé mi contraseña»

> **Status:** Draft
> **Depends on:** SPEC 03 (primitivos `bb-*`), SPEC 04 (layouts), SPEC 05 (error solo tras tocar)
> **Date:** 2026-10-09
> **Objective:** Maquetar `/forgot-password` componiendo primitivos `bb-*` dentro del shell de auth, con la validación local del correo pero sin enviar nada.

## Context

`src/app/features/auth/pages/forgot-password/forgot-password.ts` sigue siendo el `<h1>` de SPEC 02. Es la salida del callejón sin salida del login —el enlace «¿Olvidaste tu contraseña?» de SPEC 06 apunta aquí— y hoy quien llegue encuentra una línea de texto sobre negro.

La pantalla es la más sencilla de las cinco de auth: un enlace de regreso, un encabezado con icono, un campo y un botón. Su única pieza propia es ese enlace de regreso, que no se comparte con ninguna otra pantalla (las otras cuatro no lo tienen), así que este spec no roza ningún archivo de los otros cinco.

## Goals

1. `/forgot-password` reproduce `screens/02-olvide-contrasena.html` en escritorio y `referencia-diseno/MovilOlvide.dc.html` en móvil, sin hex ni `<svg>` escritos a mano.
2. El campo de correo valida obligatoriedad y formato con `@angular/forms/signals`, y su error se anuncia con texto.
3. El enlace de regreso lleva a `/login` y es alcanzable con teclado antes que el resto del contenido.
4. Enviar el formulario no navega ni dispara ninguna petición: solo marca el campo como tocado.
5. `/forgot-password` pasa AXE sin violaciones.

## Non-goals

- **No** se envía ningún correo ni se llama a `POST /auth/forgot-password`. No hay `HttpClient`, ni estado de carga, ni deshabilitado del botón durante el envío.
- **No** se navega a «Correo enviado» al enviar, ni se pasa el correo capturado por query param. El traspaso del dato es del spec de autenticación; `/forgot-password/sent` se maqueta aparte (SPEC 08) con su propio placeholder.
- **No** se maqueta el panel de marca ni el contenedor: son de `auth-layout` (SPEC 04).
- **No** se toca `shared/ui/`, `features/auth/ui/`, `auth.routes.ts` ni ningún otro archivo fuera de la carpeta de esta página.
- **No** se implementa límite de intentos, _captcha_, ni mensaje genérico anti-enumeración: eso es contrato de backend (ver el `README.md` del kit) y no tiene maqueta.
- **No** se reutiliza el enlace de regreso como componente compartido. Aparece en una sola pantalla; convertirlo en primitivo sería inventar una abstracción con un solo consumidor.

## Dependencies

- **SPEC 04.** El `<main>` centrado de 420 px y el contrato de landmarks: esta página no emite `<main>`, `<header>`, `<nav>` ni `<aside>`, y sí emite el único `<h1>`.
- **SPEC 05.** El campo no se pinta en rojo hasta que se toca.
- **SPEC 03.** `bb-icon-tile` (`icon`), `bb-field`, `bb-input`, `bb-form-message`, `button[bb-button]` y `bb-icon`. Iconos del registro: `arrow-left`, `key`, `mail`, `send`.
- **`@angular/forms/signals`.** `form`, `required`, `email`, `[formField]`, `[formRoot]`.
- **`@angular/router`.** `RouterLink` para el enlace de regreso.
- **`references/viaticos-bambu-kit/screens/02-olvide-contrasena.html` + `auth.css`** y **`referencia-diseno/MovilOlvide.dc.html`** (solo lectura).

## Functional requirements

1. El contenido es una columna con cuatro bloques en este orden: enlace de regreso, encabezado, formulario y nota de ayuda.
2. El enlace de regreso es `<a routerLink="/login">` alineado al inicio, con `<bb-icon name="arrow-left" [size]="18" />` y el texto «Volver al inicio de sesión», a `min-h-bb-touch`, `gap-2`, `text-sm text-bb-text-muted`, sin subrayado, y `text-bb-green` en hover. Es el `.back` de `auth.css`, escrito como utilidades en esta plantilla.
3. El encabezado es una columna con `gap-[18px]`: `<bb-icon-tile icon="key" />`, el `<h1>¿Olvidaste tu contraseña?</h1>` a `text-bb-h2 font-bold leading-[1.15]` (28 px por debajo de `md:`), y el párrafo «Escribe tu correo corporativo y te enviaremos un enlace para crear una nueva. El enlace vence en 30 minutos.» a `text-base leading-normal text-bb-text-muted` (15 px en móvil).
4. El modelo es `signal({ email: '' })` y el formulario es `form(modelo, (path) => { required(path.email); email(path.email); })`.
5. Los mensajes de validación son, textualmente: vacío → «Escribe tu correo corporativo.»; formato inválido → «Escribe un correo con formato válido.». Van en un `bb-form-message` con `tone="error"` bajo `@if` de `touched() && invalid()`.
6. El `<form>` lleva `[formRoot]` y `gap-[22px]`, y contiene el campo y el botón.
7. El campo es `bb-field label="Correo corporativo"` con `<bb-input [formField]="form.email" type="email" icon="mail" autocomplete="email" placeholder="nombre@bambu-techservices.com" />`. El `autocomplete` es `email`, no `username`: aquí no se está iniciando sesión.
8. El botón de envío es `<button bb-button type="submit">` con «Enviar enlace de recuperación» y `<bb-icon name="send" [size]="18" />`, en variante y tamaño por defecto.
9. El manejador de envío marca el campo como tocado y no hace nada más, con un `TODO` de una línea que marca dónde entrará la llamada al backend. El `[formRoot]` ya previene el envío nativo.
10. La nota de cierre es un `<p>` a `text-sm leading-normal text-bb-text-subtle` con «¿Ya no tienes acceso a tu correo corporativo? Contacta al área de TI para recuperar tu cuenta.». Es el `.small` del kit, no un `bb-note`: no tiene icono ni caja.
11. La plantilla puede quedar inline si cabe cómoda; si pasa de unas 30 líneas, se mueve a `forgot-password.html` junto al `.ts`, con ruta relativa.
12. El componente conserva su selector `app-forgot-password`, su clase `ForgotPassword` y su archivo `forgot-password.ts`.

## Interfaces & contracts

N/A — la pantalla no exporta nada importable. Su clase solo la referencia el `loadComponent` ya declarado en `auth.routes.ts`, y no introduce rutas, assets, tokens ni chunks nuevos.

## Edge cases

- **Primer render.** El campo se ve neutro, sin `aria-invalid`, y el botón está habilitado.
- **Envío con el campo vacío.** No navega ni recarga; el campo pasa a tocado y aparece «Escribe tu correo corporativo.» con `role="alert"`.
- **Correo de un dominio ajeno a Bambú.** Se acepta: el validador solo comprueba formato. Restringir el dominio en cliente filtraría una regla que solo el backend puede aplicar de verdad, y de paso revelaría qué dominios existen.
- **Correo con espacios.** Inválido por formato y se avisa; no se hace `trim()` silencioso.
- **Pulsar Enter en el campo.** Envía, y cae en el requisito 9.
- **Volver con el enlace de regreso después de escribir.** El estado se descarta con el componente; al regresar, el campo vuelve vacío. No se persiste nada.
- **Texto al 200 % y ancho de 320 px.** El `bb-icon-tile` mide 56 px fijos y no escala con el texto, que es lo correcto para un adorno; el título y el párrafo hacen wrap sin recortes ni scroll horizontal.
- **Doble envío rápido.** Sin efecto observable: el manejador es idempotente porque no hace nada. Cuando exista la llamada real, el deshabilitado durante el envío será parte de ese spec.
- **Concurrencia, dependencias caídas, timeouts, permisos.** N/A — la pantalla no hace I/O.

## Acceptance criteria

- [ ] Dado `/forgot-password` a 1280 px, se ve, en orden: «← Volver al inicio de sesión», el cuadro verde con la llave, «¿Olvidaste tu contraseña?», su párrafo, el campo de correo con icono de sobre, el botón verde de ancho completo con el icono de envío, y la nota gris de cierre.
- [ ] Dado `/forgot-password` a 390 px, el mismo contenido se alinea arriba bajo el logo del header móvil, el título baja a 28 px y no hay scroll horizontal.
- [ ] `document.querySelectorAll('h1')` devuelve exactamente un elemento, y es «¿Olvidaste tu contraseña?».
- [ ] La página no contiene ningún `<main>`, `<header>`, `<nav>` ni `<aside>` propio.
- [ ] Dado el campo recién cargado, no tiene `aria-invalid` ni borde naranja.
- [ ] Dado «correo-sin-arroba» en el campo, cuando pierde el foco, aparece «Escribe un correo con formato válido.» y el `<input>` queda con `aria-invalid="true"` y `aria-describedby` apuntando al mensaje.
- [ ] Dado el campo vacío, cuando se pulsa «Enviar enlace de recuperación», la URL **no** cambia y aparece el mensaje de campo obligatorio.
- [ ] Tabulando desde el inicio de la página, el primer elemento con foco es el enlace de regreso, y activarlo con Enter lleva a `/login`.
- [ ] AXE sobre `/forgot-password` reporta 0 violaciones.
- [ ] Comparada contra `screens/02-olvide-contrasena.html` lado a lado, no hay diferencias de espaciado, tamaño de fuente ni color en ninguno de los dos breakpoints.
- [ ] `pnpm build` sigue listando el chunk `forgot-password`, `pnpm test` termina sin errores y `npx prettier --check` sobre los archivos tocados pasa.
- [ ] `git diff --name-only` solo toca `src/app/features/auth/pages/forgot-password/**` y este spec.
