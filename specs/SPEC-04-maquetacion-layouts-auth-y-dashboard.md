# SPEC 04 — Maquetación de los dos layouts: shell de auth y shell del dashboard

> **Status:** Implemented — commit a447280 en `feature/layouts-auth-dashboard-shells` (pendiente de PR)
> **Depends on:** SPEC 01 (tema Tailwind), SPEC 02 (estructura por capas), SPEC 03 (primitivos `bb-*`)
> **Date:** 2026-10-09
> **Objective:** Convertir `auth-layout` y `dashboard-layout` de un `<router-outlet />` vacío a los dos shells del kit, para que las seis pantallas se maqueten después en paralelo sin que ninguna toque un archivo compartido.

## Context

SPEC 02 dejó los dos layouts como un `<router-outlet />` y SPEC 03 dejó los 18 primitivos listos, así que hoy `/login` renderiza un `<h1>` suelto sobre negro: ni marca, ni logo, ni menú.

El problema no es que falte: es quién lo construye. Las cinco pantallas de auth comparten **literalmente** el mismo panel de marca —`auth.css` lo define una vez y las cinco maquetas lo repiten verbatim—, y el Inicio necesita el sidebar, la topbar y la barra inferior antes de poder verse. Si cada spec de pantalla trajera su parte del shell, cinco ramas en paralelo escribirían el mismo `auth-layout.ts`, y el conflicto no sería de líneas sino de decisiones: cinco versiones distintas del mismo panel.

Este spec saca el shell del alcance de las pantallas y lo cierra primero. Es el único de la tanda que toca archivos compartidos (`src/styles/theme.css`, `public/img/`, los dos layouts); los seis que vienen después no tocan ninguno.

## Goals

1. Las cinco rutas de auth (`/login`, `/forgot-password`, `/forgot-password/sent`, `/reset-password`, `/reset-password/done`) renderizan el panel de marca a partir de 768 px y el header móvil con el logo centrado por debajo, sin que la página aporte una sola línea para ello.
2. `/dashboard` renderiza el sidebar fijo de 248 px con su bloque de marca, su menú y su bloque de usuario; la topbar; y, por debajo de 768 px, la barra inferior fija de cuatro destinos con el sidebar oculto.
3. Los landmarks de las seis pantallas (`<header>`, `<aside>`, `<nav>`, `<main>`) los emite exclusivamente el layout, y ese reparto queda publicado como contrato para que ninguna página lo duplique.
4. `/login` y `/dashboard` pasan AXE sin violaciones **con los stubs `<h1>` de SPEC 02 todavía en su lugar** — es decir, el shell es accesible por sí mismo, antes de que exista una sola pantalla maquetada.
5. `pnpm build` sigue produciendo los doce chunks lazy declarados en SPEC 02 + SPEC 03, con `auth-layout` y `dashboard-layout` como chunks propios, y `pnpm test` termina sin errores.

## Non-goals

- **No** se maqueta ninguna de las seis páginas. Login, Olvidé mi contraseña, Correo enviado, Restablecer, Contraseña actualizada e Inicio siguen siendo el `<h1>` que dejó SPEC 02; los maquetan los SPEC 05 a 10.
- **No** se implementa navegación hacia rutas que no existen. «Mis reportes», «Nuevo reporte», «Ayuda» y «Perfil» no tienen ruta declarada: un enlace a ellas caería en el `path: '**'` y terminaría en `/login`.
- **No** se implementa el cierre de sesión. El enlace «Cerrar sesión» navega a `/login` porque esa ruta sí existe, pero no limpia sesión, token ni estado: eso es del spec de autenticación.
- **No** se deriva la miga de pan ni el `aria-current` del estado del router más allá de `/dashboard`, que es la única ruta hija que existe hoy.
- **No** se toca `app.routes.ts`, `auth.routes.ts`, `dashboard.routes.ts`, `shared/ui/index.ts` ni ningún primitivo `bb-*`. Si un shell necesita algo que un primitivo no da, se resuelve dentro del layout con utilidades, no modificando `shared/ui/`.
- **No** se crean `features/auth/ui/` ni `features/dashboard/ui/`. El shell no es de un área: es el contenedor de ruta.
- **No** se crea un menú hamburguesa ni un sidebar colapsable. Por debajo de 768 px el sidebar desaparece y la navegación es la barra inferior, exactamente como el kit.
- **No** se implementa modo claro, animaciones de transición de ruta, ni estados de carga del shell.
- **No** hay guards, interceptores, servicios de sesión ni repositorios. El nombre y el correo del usuario son `signal()` con valor de la maqueta.

## Dependencies

- **SPEC 01 — Implemented (PR #1).** Se consumen `bg-bb-black`, `bg-bb-surface`, `border-bb-surface-2`, `bg-bb-green`, `text-bb-green`, `text-bb-text`, `text-bb-text-2`, `text-bb-text-muted`, `text-bb-text-subtle`, `text-bb-on-green`, `text-bb-badge`, `tracking-bb-badge`, `min-h-bb-touch`, `text-bb-xs` y `font-sans`. **Este spec amplía el `@theme` con dos tokens** (requisito 1); es la única modificación a `src/styles/theme.css` desde SPEC 01 y queda anotada en Risks.
- **SPEC 02 — Implemented (PR #2).** Se usan los archivos `src/app/layouts/auth-layout/auth-layout.ts` y `src/app/layouts/dashboard-layout/dashboard-layout.ts` tal como existen, sus rutas padre ya declaradas, y el prefijo `app-` reservado para layouts y páginas.
- **SPEC 03 — Implemented (PR #3).** Se consumen cinco primitivos con su API ya congelada: `bb-logo` (`width`, `priority`), `bb-icon` (`name`, `size`), `button[bb-icon-button]` (`variant="outlined"`, `aria-label` a cargo del consumidor), `bb-avatar` (`name`) y `bb-badge` (contenido proyectado). Del registro de iconos se usan `home`, `file-text`, `plus-circle`, `help-circle`, `log-out`, `bell` y `user`.
- **`@angular/common` ^22.2.0.** `NgOptimizedImage` para la imagen de fondo del panel de marca.
- **`@angular/router` ^22.2.0.** `RouterOutlet`, `RouterLink` y `RouterLinkActive` en el shell del dashboard.
- **`references/viaticos-bambu-kit/` (solo lectura).** `screens/auth.css` (bloques `Layout` y el `@media (max-width:768px)`), `screens/app.css` (bloques `Shell`, `Barra inferior` y su media query), `screens/01-login.html` y `screens/04-dashboard.html` como referencia de markup, y `assets/img/fondo-auth.webp`. ⚠️ **Este directorio está en `.gitignore` y no se clona**: ver Risks.

## Functional requirements

### Tema y assets

1. `src/styles/theme.css` suma dos colores al `@theme`, los únicos valores del kit que el tema no expone y que el shell necesita: `--color-bb-shell: #0a0a0a` (fondo del sidebar y de la barra inferior, `#0A0A0A` en `app.css`) y `--color-bb-shell-hover: #141414` (fondo de un elemento de menú en hover). No se agrega ningún otro token: los bordes `#1F1F1F` del kit ya son `bb-surface-2`.
2. `references/viaticos-bambu-kit/assets/img/fondo-auth.webp` (1920×1080, 26 KB) se copia a `public/img/fondo-auth.webp`. **No** se copia `fondo-auth.jpg`: WebP tiene soporte universal en los navegadores que esta herramienta interna soporta, y mantener dos archivos obliga a un `image-set()` que Tailwind no expresa de forma legible.

### `auth-layout` — shell de las cinco pantallas de auth

3. El host es un contenedor de alto mínimo `100dvh` en `flex` que, a partir de `md:` (768 px), reparte dos columnas de base 520 px: el panel de marca a la izquierda y el área de contenido a la derecha.
4. El panel de marca (`<aside>`) está **oculto por debajo de `md:`** y, a partir de ahí, mide al menos 420 px de alto, lleva `p-14` (56 px), separa sus tres bloques con `justify-between`, y cierra con un borde derecho `border-bb-surface-2`.
5. El fondo del panel de marca se renderiza como `<img ngSrc="/img/fondo-auth.webp" fill alt="">` posicionado detrás del contenido (`object-cover`, por debajo en el eje z), no como `background-image`. Es decorativo, así que su `alt` es vacío; no lleva `priority`, porque a `display:none` en móvil el navegador no debe descargarlo.
6. El bloque superior del panel es `<bb-logo [width]="176" />`.
7. El bloque central reproduce el héroe del kit: un `<bb-badge>HERRAMIENTA INTERNA</bb-badge>`, el texto de marca «Control de **Viáticos**» a `text-bb-display` / `leading-bb-tight` / `font-bold` con «Viáticos» en `text-bb-green italic`, una regla de 72×3 px en `bg-bb-green`, y el párrafo de apoyo a `text-lg leading-normal text-bb-text-2`, todo con ancho máximo de 460 px.
8. **El texto de marca es un `<p>`, no un `<h1>`.** Es una declaración decorativa que además desaparece en móvil; el `<h1>` de cada pantalla lo emite la página (requisito 20). Es una desviación deliberada del markup del kit, que dejaba a las pantallas móviles sin ningún `h1`.
9. El bloque inferior del panel es el pie: «© 2026 Bambú Tech Services» a la izquierda y «v1.0» en `text-bb-green` a la derecha, ambos a `text-bb-xs text-bb-text-subtle`, con `flex-wrap`.
10. El header móvil (`<header>`) es la imagen espejo: **solo visible por debajo de `md:`**, centra un `<bb-logo [width]="132" />` y lleva el `pt-10 px-6 pb-2` del kit.
11. El área de contenido es el `<main>`, centrado vertical y horizontalmente a partir de `md:` con `p-14 px-6`, y alineado arriba con `pt-10 px-6 pb-8` por debajo. Dentro, un contenedor de ancho máximo `container-bb-form` (420 px) en columna, con `gap-8` en escritorio y `gap-7` (28 px) en móvil, que envuelve al `<router-outlet />`.
12. `auth-layout` no declara ningún otro landmark, no inyecta nada, y no conoce qué página está montada.

### `dashboard-layout` — shell del área privada

13. El host es un `flex` de alto mínimo `100dvh` con el sidebar y la columna de contenido.
14. El sidebar (`<aside>`) mide exactamente 248 px (`flex: 0 0 248px`), lleva `bg-bb-shell`, borde derecho `border-bb-surface-2`, `py-7 px-4` y separa sus tres bloques con `gap-8`. **Está oculto por debajo de `md:`.**
15. El bloque de marca del sidebar es un `<bb-logo [width]="120" />` sobre un rótulo «CONTROL DE VIÁTICOS» a `text-bb-badge font-bold tracking-bb-badge text-bb-green`.
16. El menú (`<nav aria-label="Principal">`) renderiza los cuatro destinos del kit a partir de una constante `NAV_ITEMS` declarada en `layouts/dashboard-layout/nav-items.ts`: Inicio (`home`, ruta `/dashboard`), Mis reportes (`file-text`), Nuevo reporte (`plus-circle`) y Ayuda (`help-circle`). Cada elemento mide al menos `min-h-bb-touch`, lleva `gap-3`, `px-3`, `rounded-md`, `text-[15px] text-bb-text-2`, y en hover `bg-bb-shell-hover text-bb-text`.
17. **Solo «Inicio» es un enlace.** Se renderiza como `<a routerLink="/dashboard" routerLinkActive ariaCurrentWhenActive="page">`, y el estado activo pinta `bg-bb-green text-bb-on-green font-bold`. Los otros tres se renderizan como `<span>` con `aria-disabled="true"`: no son focalizables y los lectores de pantalla no los anuncian como enlaces, porque su ruta no existe y un `routerLink` a ella terminaría redirigiendo a `/login`.
18. El bloque de usuario se ancla al fondo (`mt-auto`), separado por un borde superior `border-bb-surface-2`, y contiene `<bb-avatar [name]="userName()" />` junto al nombre (`text-sm font-bold`) y el correo (`text-xs text-bb-text-subtle`, truncado con elipsis en una línea), más el enlace «Cerrar sesión» con icono `log-out`, `min-h-bb-touch`, `text-sm text-bb-text-muted` y verde en hover. El enlace es `<a routerLink="/login">` con un comentario que marca que la limpieza de sesión la agrega el spec de autenticación.
19. `userName` y `userEmail` son `signal()` privados del layout con los valores de la maqueta («Juan Manuel Galindo» / «juanma@bambu-techservices.com») y un `TODO` que marca el punto de inyección del servicio de sesión.
20. La topbar (`<header>`) lleva borde inferior `border-bb-surface-2` y, en escritorio (`md:` en adelante), `px-10 py-5` con tres zonas: el logo oculto, la miga de pan a `text-sm text-bb-text-subtle` y el botón de notificaciones a la derecha.
21. El botón de notificaciones es `<button bb-icon-button variant="outlined" aria-label="Notificaciones">` con `<bb-icon name="bell" />`.
22. La miga de pan es un `signal()` privado del layout con el valor `'Inicio'` y un `TODO`: derivarla del `title` de la ruta activa es del spec de navegación, y hoy solo existe una ruta hija.
23. Por debajo de `md:`, la topbar se centra y muestra el `<bb-logo [width]="108" />` en lugar de la miga, con `pt-9 px-4 pb-3`, y el botón de notificaciones se posiciona absoluto a la derecha y pierde el borde.
24. El `<main>` tiene ancho máximo 1180 px, `p-10` y `gap-8` en escritorio; por debajo de `md:`, `pt-6 px-5 pb-28` (los 112 px inferiores dejan sitio a la barra fija) y `gap-[22px]`. Contiene el `<router-outlet />` y nada más.
25. La barra inferior (`<nav aria-label="Principal (móvil)">`) **solo existe por debajo de `md:`**: fija al borde inferior, en rejilla de cuatro columnas, `bg-bb-shell`, borde superior `border-bb-surface-2`, y su relleno inferior suma `env(safe-area-inset-bottom)`.
26. Cada destino de la barra mide al menos 52 px de alto, apila icono de 22 px y etiqueta de 11 px, y lleva `text-bb-text-subtle`; el activo va en `text-bb-green font-bold` con `aria-current="page"`. Igual que en el menú lateral, **solo «Inicio» es enlace**; «Reportes», «Ayuda» y «Perfil» son `<span aria-disabled="true">`.
27. El `index.html` ya declara `viewport-fit=cover`, o este spec lo agrega: sin él, `env(safe-area-inset-bottom)` vale siempre 0 y la barra queda bajo el indicador de inicio de iOS.
28. Ninguno de los dos layouts usa plantilla inline: por tamaño, cada uno vive en su `auth-layout.html` / `dashboard-layout.html` junto al `.ts`, con ruta relativa al archivo del componente.

## Interfaces & contracts

**Contrato de landmarks** — lo que cada página puede y no puede emitir. Es la frontera que permite que los SPEC 05 a 10 corran en paralelo sin pisarse en accesibilidad:

| Elemento                       | Lo emite                                  | Una página…                           |
| ------------------------------ | ----------------------------------------- | ------------------------------------- |
| `<header>`                     | el layout (header móvil de auth / topbar) | nunca lo emite                        |
| `<aside>`                      | el layout (panel de marca / sidebar)      | nunca lo emite                        |
| `<nav>`                        | el layout (menú lateral / barra inferior) | nunca lo emite                        |
| `<main>`                       | el layout (área de contenido)             | nunca lo emite                        |
| `<h1>`                         | **ninguno de los dos layouts**            | **lo emite siempre, exactamente uno** |
| `<section>`, `<form>`, `<h2>`… | —                                         | libre dentro de su contenido          |

**Tokens nuevos en `src/styles/theme.css`:**

```css
--color-bb-shell: #0a0a0a; /* bg-bb-shell       — sidebar y barra inferior */
--color-bb-shell-hover: #141414; /* bg-bb-shell-hover — hover de un ítem de menú */
```

**Asset público nuevo:** `public/img/fondo-auth.webp` (1920×1080, 26 KB, decorativo).

**Constante exportada:**

```ts
// src/app/layouts/dashboard-layout/nav-items.ts
export interface NavItem {
  readonly label: string;
  readonly icon: BbIconName;
  readonly route?: string; // ausente = destino pendiente, se renderiza inerte
  readonly mobileLabel?: string; // la barra inferior abrevia «Mis reportes» → «Reportes»
}
export const NAV_ITEMS: readonly NavItem[];
```

**Rutas:** ninguna nueva, ninguna modificada. `app.routes.ts`, `auth.routes.ts` y `dashboard.routes.ts` quedan intactos.

**Chunks de `pnpm build`:** los doce de SPEC 02 + SPEC 03, sin altas ni bajas. `nav-items.ts` entra en el chunk de `dashboard-layout`, no en el inicial.

## Non-functional requirements

- **Touch targets:** cada elemento interactivo de ambos shells mide ≥ 44×44 px — los del menú lateral por `min-h-bb-touch`, los de la barra inferior por sus 52 px, y el botón de notificaciones por el `min-w/min-h` que ya trae `bb-icon-button`.
- **Safe area:** la barra inferior suma `env(safe-area-inset-bottom)` a su relleno y el `<main>` reserva 112 px inferiores, de modo que ningún contenido queda bajo la barra ni bajo el indicador de inicio de iOS.
- **Sin scroll horizontal a 320 px** y sin recortes con el texto al 200 % (WCAG 1.4.4 y 1.4.10): el correo del bloque de usuario es el único texto que trunca, y lo hace con elipsis por diseño.
- **Contraste AA:** las combinaciones nuevas que introduce este spec se verifican sobre `bb-shell` (#0A0A0A), que es 0.3 % más claro que el negro puro ya auditado en SPEC 03; ninguna baja de 4.5:1 para texto ni de 3:1 para bordes e iconos.
- **AXE sin violaciones** en `/login` y en `/dashboard`, con un solo `banner`, un solo `main`, y cada `<nav>` con su `aria-label` propio (dos `nav` sin etiqueta distinta son una violación de «landmark-unique»).
- **Peso:** el fondo de auth son 26 KB en WebP y no se descarga en móvil. No se agrega ninguna dependencia al `package.json`.

## Edge cases

- **El breakpoint del kit y el de Tailwind difieren en un píxel.** El kit oculta el panel de marca con `max-width:768px`; `md:` de Tailwind lo muestra desde `min-width:768px`. A exactamente 768 px el kit está en móvil y la app en escritorio. Se adopta `md:` (decisión heredada de SPEC 01) y se documenta: a 768 px clavados la app muestra el panel de marca.
- **El logo sobre el sidebar.** `bb-logo` sirve un JPEG opaco con fondo negro, y el sidebar es `#0A0A0A`. La diferencia es de 10/255 (≈4 %): a 120 px de ancho no es perceptible, pero existe. Ver Risks.
- **`fondo-auth.webp` no carga.** El `<img>` decorativo queda vacío y el panel se ve sobre `bg-bb-black`, que es el fondo declarado debajo. No hay fallback a JPEG y no hace falta: el texto de marca sigue legible.
- **Viewport muy bajo (ej. 844×390 en horizontal).** El panel de marca tiene `min-h-[420px]` y el `<main>` centra su contenido: a menos de 420 px de alto aparece scroll vertical, que es el comportamiento correcto. No se fija alto al viewport con `h-screen`.
- **Pantalla de auth cuyo contenido excede 420 px de ancho.** No la hay: las seis maquetas caben en `container-bb-form`. Si una la excediera, es la página la que debe ajustar su propio ancho, no el layout.
- **Alguien navega a `/dashboard` sin sesión.** Hoy entra: no hay guard, y es un non-goal explícito. El shell renderiza con los datos placeholder del requisito 19.
- **Nombre de usuario vacío o de una sola palabra en el sidebar.** `bb-avatar` ya lo resuelve (SPEC 03): sin nombre, círculo vacío; una palabra, una inicial. El bloque de texto a su lado se degrada a una línea vacía, no rompe la maqueta.
- **Correo de usuario muy largo.** Trunca con elipsis en una línea; el nombre completo no trunca. El `title` no se agrega: duplicar el texto en un tooltip que el teclado no alcanza no mejora nada.
- **Los tres destinos inertes del menú reciben foco por teclado.** No pueden: son `<span>` sin `tabindex`. Tabular desde el logo salta directamente a «Inicio» y de ahí al bloque de usuario.
- **Acceso concurrente, dependencias caídas, timeouts, permisos.** N/A — ningún layout hace I/O, inyecta un repositorio ni consulta sesión.

## Acceptance criteria

- [ ] `src/styles/theme.css` declara `--color-bb-shell` y `--color-bb-shell-hover`, y ningún archivo de este spec escribe un hex literal.
- [ ] `public/img/fondo-auth.webp` existe (1920×1080) y `fondo-auth.jpg` **no** se copió.
- [ ] Dado `/login` a 1280 px, se ve el panel de marca con logo, badge, «Control de _Viáticos_», la regla verde, el párrafo y el pie con «v1.0» en verde; el `<h1>` stub de la página aparece centrado en la columna derecha dentro de un ancho máximo de 420 px.
- [ ] Dado `/login` a 390 px, el panel de marca no se renderiza, aparece el header con el logo centrado a 132 px, y el contenido queda alineado arriba.
- [ ] El panel de marca contiene cero elementos `<h1>`; `document.querySelectorAll('h1')` en `/login` devuelve exactamente el `<h1>` de la página.
- [ ] Dado `/dashboard` a 1280 px, se ven el sidebar de 248 px con los cuatro ítems, «Inicio» con fondo verde y `aria-current="page"`, el bloque de usuario abajo con avatar, nombre, correo y «Cerrar sesión»; la topbar muestra «Inicio» y el botón de notificaciones con borde.
- [ ] Dado `/dashboard` a 390 px, el sidebar no se renderiza, la topbar centra el logo a 108 px con el botón de notificaciones sin borde a la derecha, y la barra inferior fija muestra los cuatro destinos con «Inicio» en verde.
- [ ] Tabulando `/dashboard` con teclado, el foco pasa por el logo (si es enlace), «Inicio», «Cerrar sesión» y el botón de notificaciones — y **no** por «Mis reportes», «Nuevo reporte» ni «Ayuda».
- [ ] AXE sobre `/login` y sobre `/dashboard` reporta 0 violaciones, incluyendo `landmark-unique`, `landmark-one-main` y `region`.
- [ ] A 320 px de ancho no hay scroll horizontal en ninguna de las dos rutas; con el texto al 200 % ningún elemento del shell recorta contenido.
- [ ] En iOS (o emulando `env(safe-area-inset-bottom)`), el contenido del `<main>` no queda tapado por la barra inferior.
- [ ] `pnpm build` lista los doce chunks lazy esperados, con `auth-layout` y `dashboard-layout` entre ellos.
- [ ] `pnpm test` termina sin errores y `npx prettier --check` sobre los archivos tocados pasa.
- [ ] `git diff --name-only` no incluye `app.routes.ts`, `auth.routes.ts`, `dashboard.routes.ts`, `shared/ui/**` ni ninguna página de `features/*/pages/`.

## Risks

- **`references/viaticos-bambu-kit/` está en `.gitignore` y no existe en este clon.** Ninguna rama ni worktree lo trae: hay que copiarlo (o enlazarlo) a mano en cada worktree antes de implementar, o la implementación se hará de memoria. Es el riesgo más probable de los siete specs de esta tanda, porque afecta a todos por igual.
- **El logo sobre `bb-shell`.** El JPEG opaco dibuja un rectángulo 4 % más oscuro que el sidebar. **Decisión:** se usa tal cual; a 120 px el borde no es perceptible y el día que diseño entregue un SVG o un PNG con transparencia, `bb-logo` cambia su `ngSrc` en un solo archivo y las tres apariciones del logo se corrigen juntas. Si al revisar contra la maqueta el rectángulo sí se nota, la corrección es pedir el asset, nunca recortar el JPEG (deja halo).
- **Este spec modifica `src/styles/theme.css`, que es territorio de SPEC 01 (Implemented).** Es una ampliación aditiva de dos tokens, no un cambio de valores existentes, y queda registrada aquí porque SPEC 01 ya no se edita. Cualquier spec posterior que necesite otro valor del kit ausente del tema sigue este mismo camino: lo agrega y lo documenta, no lo hardcodea.
- **El shell se construye antes que cualquier pantalla real.** Si al maquetar Login (SPEC 05) aparece que el `<main>` necesita otro reparto, el ajuste toca un archivo que seis ramas ya tienen de base. Mitigación: los seis specs siguientes declaran explícitamente que no modifican los layouts; si uno lo necesita, se para y se abre un spec de corrección en vez de parchear en su rama.
