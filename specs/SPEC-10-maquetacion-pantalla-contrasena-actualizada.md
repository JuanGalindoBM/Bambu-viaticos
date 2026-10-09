# SPEC 10 — Maquetación de la pantalla «Contraseña actualizada»

> **Status:** Draft
> **Depends on:** SPEC 03 (primitivos `bb-*`), SPEC 04 (layouts)
> **Date:** 2026-10-09
> **Objective:** Maquetar `/reset-password/done` componiendo primitivos `bb-*` dentro del shell de auth.

## Context

`src/app/features/auth/pages/reset-password-done/reset-password-done.ts` sigue siendo el `<h1>` de SPEC 02. Es el acuse que cierra el flujo de recuperación: confirma el cambio, avisa de que se cerraron las demás sesiones y devuelve al login.

Es la pantalla más simple de las seis —no tiene formulario, ni estado, ni temporizador— y por eso es la primera candidata a implementarse mientras las otras cinco avanzan en paralelo: tres bloques estáticos y un enlace.

## Goals

1. `/reset-password/done` reproduce `screens/03b-contrasena-actualizada.html` en escritorio y `referencia-diseno/MovilActualizada.dc.html` en móvil, sin hex ni `<svg>` escritos a mano.
2. El título combina texto blanco y la palabra destacada en verde cursiva sin romper el encabezado en dos elementos de título.
3. El botón de cierre lleva a `/login`.
4. `/reset-password/done` pasa AXE sin violaciones.

## Non-goals

- **No** se comprueba que venga de un restablecimiento real. Entrar directo a la URL la muestra igual; condicionar el acceso es un guard, y los guards están fuera de esta tanda.
- **No** se cierra ninguna sesión. El texto lo anuncia porque lo hará el backend; la pantalla no ejecuta nada.
- **No** se maqueta el panel de marca ni el contenedor: son de `auth-layout` (SPEC 04).
- **No** se toca `shared/ui/`, `features/auth/ui/`, `auth.routes.ts` ni ningún archivo fuera de la carpeta de esta página.
- **No** se agrega redirección automática al login después de N segundos: el kit no la tiene, y quitarle al usuario el control del momento de salir es peor que un botón.

## Dependencies

- **SPEC 04.** El `<main>` centrado de 420 px y el contrato de landmarks: esta página no emite `<main>`, `<header>`, `<nav>` ni `<aside>`, y sí emite el único `<h1>`.
- **SPEC 03.** `bb-status-circle` (`icon`), `bb-note` (`icon`), `a[bb-button]` y `bb-icon`. Iconos del registro: `check`, `shield-check`, `arrow-right`.
- **`@angular/router`.** `RouterLink` para el botón de cierre.
- **`references/viaticos-bambu-kit/screens/03b-contrasena-actualizada.html` + `auth.css`** y **`referencia-diseno/MovilActualizada.dc.html`** (solo lectura).

## Functional requirements

1. El contenido es una columna con tres bloques: encabezado, aviso de seguridad y botón.
2. El encabezado es una columna con `gap-[18px]`: `<bb-status-circle icon="check" />`, el título y el párrafo.
3. El título es un solo `<h1>` a `text-bb-h2 font-bold leading-[1.15]` (28 px por debajo de `md:`) con el texto «Contraseña » y, dentro, un `<span class="text-bb-green italic">actualizada</span>`. Es el `.accent` del kit: una sola cabecera, no dos elementos.
4. El párrafo es «Ya puedes iniciar sesión con tu nueva contraseña.» a `text-base leading-normal text-bb-text-muted` (15 px en móvil).
5. El aviso es `<bb-note icon="shield-check">` con «Por seguridad cerramos las sesiones abiertas en otros dispositivos. Si no fuiste tú quien hizo este cambio, avisa de inmediato al área de TI.».
6. El botón de cierre es `<a bb-button routerLink="/login">` con «Iniciar sesión» y `<bb-icon name="arrow-right" [size]="18" />`, en variante y tamaño por defecto (`primary` / `lg` / `block`).
7. La plantilla queda inline: el contenido cabe de sobra en una plantilla legible.
8. El componente conserva su selector `app-reset-password-done`, su clase `ResetPasswordDone` y su archivo `reset-password-done.ts`.

## Interfaces & contracts

N/A — la pantalla no exporta nada importable. Su clase solo la referencia el `loadComponent` ya declarado en `auth.routes.ts`, no tiene inputs ni outputs, y no introduce rutas, assets, tokens ni chunks nuevos.

## Edge cases

- **Entrar directo por URL sin haber restablecido nada.** Se muestra igual. Es un non-goal explícito y no es un problema de seguridad: la pantalla no revela nada y no ejecuta nada.
- **El icono del círculo mide 30 px y el del kit 32.** `bb-status-circle` fija el tamaño del icono en 30 px (SPEC 03), y esta maqueta usa 32. Se acepta la diferencia de 2 px: cambiarla obligaría a abrir el primitivo para una sola pantalla, y el círculo de 64 px —que es lo que se percibe— es idéntico.
- **Texto al 200 % y ancho de 320 px.** El círculo mide 64 px fijos (es un adorno); el título hace wrap manteniendo la palabra verde junto al resto, y el botón conserva su alto mínimo. Sin scroll horizontal.
- **Lectura por lectores de pantalla.** El `<span>` verde no interrumpe el anuncio: se lee «Contraseña actualizada» como una sola cabecera de nivel 1.
- **Navegar atrás tras pulsar «Iniciar sesión».** Devuelve a esta pantalla, que sigue siendo estática y correcta. No hay estado que restaurar.
- **Entrada vacía, concurrencia, dependencias caídas, timeouts, permisos.** N/A — la pantalla no tiene entradas ni hace I/O.

## Acceptance criteria

- [ ] Dado `/reset-password/done` a 1280 px, se ve, en orden: el círculo verde con el check, «Contraseña _actualizada_» con la segunda palabra en verde cursiva, el párrafo, el aviso con el escudo verde y el botón verde de ancho completo con la flecha.
- [ ] Dado `/reset-password/done` a 390 px, el mismo contenido se alinea arriba bajo el logo del header móvil, el título baja a 28 px y no hay scroll horizontal.
- [ ] `document.querySelectorAll('h1')` devuelve exactamente un elemento, y su `textContent` es «Contraseña actualizada».
- [ ] La página no contiene ningún `<main>`, `<header>`, `<nav>` ni `<aside>` propio.
- [ ] El botón «Iniciar sesión» lleva a `/login` y el `title` del documento cambia a «Iniciar sesión».
- [ ] Tabulando la página, el único elemento que recibe foco dentro del contenido es ese botón.
- [ ] AXE sobre `/reset-password/done` reporta 0 violaciones.
- [ ] Comparada contra `screens/03b-contrasena-actualizada.html` lado a lado, no hay diferencias de espaciado, tamaño de fuente ni color en ninguno de los dos breakpoints, salvo los 2 px del icono del requisito del círculo.
- [ ] `pnpm build` sigue listando el chunk `reset-password-done`, `pnpm test` termina sin errores y `npx prettier --check` sobre los archivos tocados pasa.
- [ ] `git diff --name-only` solo toca `src/app/features/auth/pages/reset-password-done/**` y este spec.
