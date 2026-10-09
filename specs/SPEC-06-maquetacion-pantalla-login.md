# SPEC 06 — Maquetación de la pantalla de inicio de sesión

> **Status:** Draft
> **Depends on:** SPEC 03 (primitivos `bb-*`), SPEC 04 (layouts), SPEC 05 (error solo tras tocar)
> **Date:** 2026-10-09
> **Objective:** Maquetar `/login` componiendo primitivos `bb-*` dentro del shell de auth, con el estado local del formulario pero sin backend ni sesión.

## Context

`src/app/features/auth/pages/login/login.ts` es el `<h1>Iniciar sesión</h1>` que dejó SPEC 02. Es la primera pantalla que ve cualquiera que abra la app —`/` redirige a `/login`— y hoy no se parece a `references/viaticos-bambu-kit/screens/01-login.html` en nada.

Con SPEC 04 el shell ya pone la marca y el `<main>`, y con SPEC 03 y SPEC 05 los controles ya existen y ya se comportan. Lo que falta es exactamente el contenido de la columna derecha: encabezado, formulario de dos campos, casilla de sesión y aviso de alta. Este spec no comparte un solo archivo con los otros cinco de pantalla: puede implementarse en su propio worktree desde el primer minuto.

## Goals

1. `/login` reproduce `screens/01-login.html` en escritorio y su variante móvil (`referencia-diseno/MovilLogin.dc.html`) sin escribir un solo hex ni un solo `<svg>`.
2. El formulario es un `FieldTree` de `@angular/forms/signals` con validación de correo y contraseña, y sus errores se anuncian con texto, no solo con color.
3. El botón de mostrar/ocultar contraseña funciona y su nombre accesible cambia con el estado.
4. Enviar el formulario no navega, no hace ninguna petición y no deja la página en un estado intermedio: solo marca los campos como tocados para que la validación se vea.
5. `/login` pasa AXE sin violaciones y el recorrido con teclado llega a todos los controles en el orden visual.

## Non-goals

- **No** se autentica a nadie. No hay `HttpClient`, ni servicio de sesión, ni repositorio, ni token, ni redirección al dashboard al enviar.
- **No** se implementa «Mantener la sesión iniciada»: la casilla captura su valor en el modelo y ahí se queda.
- **No** se maqueta el panel de marca, el header móvil ni el contenedor centrado: son de `auth-layout` (SPEC 04).
- **No** se toca `shared/ui/`. Si un primitivo no alcanza, se para y se abre un spec de corrección; no se parchea desde la página.
- **No** se toca `auth.routes.ts`: la ruta, su `title` y su orden ya están declarados desde SPEC 02.
- **No** se crea nada en `features/auth/ui/`. Esta pantalla no comparte ninguna pieza con las otras cuatro de auth.
- **No** se implementa recordar el correo entre visitas, ni autocompletado propio, ni medidor de fortaleza (eso es de la pantalla de restablecer).
- **No** se manejan errores del servidor («correo o contraseña incorrectos»). El `status="error"` de `bb-input` es la vía prevista y la usará el spec de autenticación.

## Dependencies

- **SPEC 04.** El `<main>` centrado de ancho máximo 420 px, y el contrato de landmarks: esta página **no** emite `<main>`, `<header>`, `<nav>` ni `<aside>`, y **sí** emite el único `<h1>` del documento.
- **SPEC 05.** La regla «el borde de error y el `aria-invalid` esperan a que el campo se toque». Sin ella los dos campos nacerían en rojo.
- **SPEC 03.** `bb-field` (`label`, slot `[bbFieldAction]`), `bb-input` (`type`, `placeholder`, `autocomplete`, `icon`, slot `[bbInputAction]`), `bb-checkbox`, `bb-form-message` (`tone`), `button[bb-button]` (`variant`, `size`, `fit`), `button[bb-icon-button]` (`variant="ghost"`), `bb-icon` y `bb-note` (`icon`). Iconos del registro: `mail`, `lock`, `eye`, `eye-off`, `arrow-right`, `shield-check`.
- **`@angular/forms/signals`.** `form`, `required`, `email`, la directiva `FormField` (`[formField]`) y la directiva `FormRoot` (`[formRoot]`), que pone `novalidate` y previene el `submit` nativo.
- **`@angular/router`.** `RouterLink` para «¿Olvidaste tu contraseña?».
- **`references/viaticos-bambu-kit/screens/01-login.html` + `auth.css`** y **`referencia-diseno/MovilLogin.dc.html`** (solo lectura).

## Functional requirements

1. El contenido de la página es una columna con `gap-8` (28 px por debajo de `md:`, ya resuelto por el contenedor de SPEC 04) y tres bloques: encabezado, formulario y aviso.
2. El encabezado es `<h1>Inicia sesión</h1>` a `text-bb-h2 font-bold leading-[1.15]` (28 px por debajo de `md:`) seguido del párrafo «Usa tu correo corporativo de Bambú para entrar.» a `text-base leading-normal text-bb-text-muted` (15 px en móvil), separados por `gap-3`.
3. El modelo es `signal({ email: '', password: '', remember: false })` y el formulario es `form(modelo, (path) => { required(path.email); email(path.email); required(path.password); })`.
4. Los mensajes de validación son, textualmente: correo vacío → «Escribe tu correo corporativo.»; correo con formato inválido → «Escribe un correo con formato válido.»; contraseña vacía → «Escribe tu contraseña.». Se renderizan en un `bb-form-message` con `tone="error"` bajo `@if` de `touched() && invalid()`.
5. El `<form>` lleva `[formRoot]="loginForm"` y una columna con `gap-[22px]`, que es el `.stack` del kit.
6. Campo de correo: `bb-field label="Correo corporativo"` con `<bb-input [formField]="loginForm.email" type="email" icon="mail" autocomplete="username" placeholder="nombre@bambu-techservices.com" />`.
7. Campo de contraseña: `bb-field label="Contraseña"` con el enlace «¿Olvidaste tu contraseña?» proyectado en `[bbFieldAction]` como `<a routerLink="/forgot-password" class="text-sm">`, que es el `.field__row` del kit.
8. El control de contraseña es `<bb-input [formField]="loginForm.password" [type]="passwordVisible() ? 'text' : 'password'" icon="lock" autocomplete="current-password" placeholder="Tu contraseña" />`.
9. Dentro de ese `bb-input` se proyecta, con el atributo `bbInputAction`, un `<button bb-icon-button type="button">` que alterna `passwordVisible`, un `signal(false)` privado de la página.
10. El botón del ojo muestra `<bb-icon name="eye" />` cuando la contraseña está oculta y `name="eye-off"` cuando está visible, y su `aria-label` cambia entre «Mostrar contraseña» y «Ocultar contraseña». Es `type="button"`: dentro de un `<form>`, sin `type`, enviaría.
11. La casilla es `<bb-checkbox [formField]="loginForm.remember">Mantener la sesión iniciada en este equipo</bb-checkbox>`.
12. El botón de envío es `<button bb-button type="submit">` con el texto «Iniciar sesión» y `<bb-icon name="arrow-right" [size]="18" />`, en su variante y tamaño por defecto (`primary` / `lg` / `block`), que es exactamente el `.btn--primary` de auth.
13. El manejador de envío marca todos los campos como tocados para que la validación se vea, y no hace nada más. Lleva un `TODO` de una línea que marca el punto donde el spec de autenticación pondrá la llamada al backend. El `[formRoot]` ya previene el envío nativo, así que la página no navega.
14. El bloque de aviso es `<bb-note icon="shield-check">` con el texto «¿Aún no tienes acceso? Esta es una herramienta interna: solicita tu alta al área de TI de Bambú.».
15. La plantilla vive en `login.html`, junto al `.ts`, con ruta relativa: supera con holgura el tamaño en el que una plantilla inline sigue siendo legible.
16. El componente conserva su selector `app-login` y su nombre de clase `Login`; el archivo sigue siendo `login.ts`, sin sufijo.

## Interfaces & contracts

N/A — esta pantalla no exporta nada que otro archivo pueda importar. Su clase `Login` solo la referencia el `loadComponent` ya declarado en `auth.routes.ts`, su modelo y sus signals son `protected`/privados, y no introduce rutas, assets, tokens ni chunks nuevos.

## Edge cases

- **Primer render con el formulario vacío.** Los dos campos se ven neutros, sin borde de error y sin `aria-invalid` (SPEC 05). El botón de envío está **habilitado**: no se deshabilita por invalidez, porque un botón muerto no explica qué falta.
- **Envío con los dos campos vacíos.** No navega, no se recarga; los dos campos pasan a tocados y aparecen sus dos mensajes de error, cada uno con `role="alert"` (lo pone `bb-form-message` con `tone="error"`).
- **Correo con espacios al inicio o al final.** El validador `email` lo marca inválido y el mensaje de formato aparece. No se hace `trim()` silencioso: normalizar la entrada del usuario sin avisar es del spec de autenticación, y hacerlo aquí escondería el error.
- **Autocompletado del navegador o de un gestor de contraseñas.** Rellena por evento `input`, que es el que `bb-input` escucha, así que el modelo se entera. ⚠️ Chrome pinta `:-webkit-autofill` con fondo claro y rompe el tema oscuro del campo; si se reproduce, la corrección es una regla en `bb-input` (spec nuevo sobre `shared/ui/`), **nunca** un parche de CSS en esta página.
- **Alternar la visibilidad de la contraseña.** Cambia el `type` del mismo `<input>`, así que el valor y el foco se conservan. El icono y el `aria-label` cambian juntos; el botón no anuncia el valor de la contraseña.
- **Teclado.** El orden de tabulación es correo → «¿Olvidaste tu contraseña?» → contraseña → botón del ojo → casilla → «Iniciar sesión». El enlace queda antes del campo que etiqueta porque así está en el DOM y así lo pinta el kit; es el orden visual, no hay `tabindex` que corregir.
- **Texto al 200 % y ancho de 320 px.** El `.field__row` hace `flex-wrap`: la etiqueta y el enlace se apilan en vez de solaparse. Ningún control recorta su contenido, porque todos llevan `min-height`.
- **Pulsar Enter dentro de un campo.** Envía el formulario, que es el comportamiento nativo esperado, y cae en el requisito 13: marca tocado y no hace nada más.
- **Dos sesiones de la misma página o navegación de ida y vuelta.** El estado vive en signals del componente y se descarta al destruirlo. No hay persistencia, ni `localStorage`, ni restauración.
- **Concurrencia, dependencias caídas, timeouts, permisos.** N/A — la pantalla no hace I/O.

## Acceptance criteria

- [ ] Dado `/login` a 1280 px, la columna derecha muestra, en orden: «Inicia sesión», su párrafo, el campo de correo con icono de sobre, el campo de contraseña con icono de candado y el enlace de olvido alineado a la derecha de su etiqueta, la casilla de sesión, el botón verde de ancho completo con la flecha, y el aviso con el escudo verde.
- [ ] Dado `/login` a 390 px, el mismo contenido se alinea arriba bajo el logo del header móvil, el título baja a 28 px y no aparece scroll horizontal.
- [ ] `document.querySelectorAll('h1')` devuelve exactamente un elemento, y es «Inicia sesión».
- [ ] La página no contiene ningún `<main>`, `<header>`, `<nav>` ni `<aside>` propio.
- [ ] Dado el formulario recién cargado, ningún `<input>` tiene `aria-invalid` ni borde naranja.
- [ ] Dado el campo de correo con «no-es-un-correo», cuando pierde el foco, entonces aparece «Escribe un correo con formato válido.» y el `<input>` queda con `aria-invalid="true"` y `aria-describedby` apuntando al mensaje.
- [ ] Dado el formulario vacío, cuando se pulsa «Iniciar sesión», entonces la URL **no** cambia, la página no se recarga y aparecen los dos mensajes de error.
- [ ] Dado el botón del ojo, cuando se activa con teclado, entonces la contraseña se vuelve legible, el icono cambia a `eye-off` y el `aria-label` pasa a «Ocultar contraseña»; al volver a activarlo, revierte.
- [ ] El enlace «¿Olvidaste tu contraseña?» lleva a `/forgot-password` y el `title` del documento cambia a «Olvidé mi contraseña».
- [ ] AXE sobre `/login` reporta 0 violaciones.
- [ ] Comparada contra `screens/01-login.html` lado a lado, no hay diferencias de espaciado, tamaño de fuente ni color en ninguno de los dos breakpoints.
- [ ] `pnpm build` sigue listando el chunk `login`, `pnpm test` termina sin errores y `npx prettier --check` sobre los archivos tocados pasa.
- [ ] `git diff --name-only` solo toca `src/app/features/auth/pages/login/**` y este spec.
