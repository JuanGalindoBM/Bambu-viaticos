# SPEC 11 — Maquetación de la pantalla de Inicio del dashboard

> **Status:** Draft
> **Depends on:** SPEC 03 (primitivos `bb-*`), SPEC 04 (layouts)
> **Date:** 2026-10-09
> **Objective:** Maquetar `/dashboard` componiendo primitivos `bb-*` dentro del shell del dashboard, con los datos en estado vacío de primer ingreso.

## Context

`src/app/features/dashboard/pages/home/home.ts` sigue siendo el `<h1>Inicio</h1>` de SPEC 02. Es la única pantalla del área privada y el destino de todo el flujo de auth: lo que ve alguien que acaba de entrar por primera vez.

La maqueta del kit retrata precisamente ese momento —cuatro contadores en cero, la tabla de reportes vacía y el bloque de «cómo funciona»—, así que no hace falta inventar datos de ejemplo para maquetarla: el estado vacío _es_ el diseño. SPEC 04 ya puso el sidebar, la topbar y la barra inferior; aquí entra solo el contenido del `<main>`. Es la única pantalla de la tanda fuera de `features/auth/`.

## Goals

1. `/dashboard` reproduce el contenido de `screens/04-dashboard.html` en escritorio y `referencia-diseno/MovilDashboard.dc.html` en móvil, sin hex ni `<svg>` escritos a mano.
2. Los cuatro contadores de resumen se renderizan desde una sola estructura de datos, con el de «Por reembolsar» destacado y con su unidad.
3. La tarjeta de reportes recientes muestra su estado vacío, y lo que cambia cuando haya datos está declarado en un solo sitio.
4. El contenido se adapta al móvil como el kit: tarjetas en dos columnas, cabecera de tabla y bloque de pasos ocultos, y botón de ancho completo.
5. `/dashboard` pasa AXE sin violaciones, con el contenido del `<main>` sumado al shell de SPEC 04.

## Non-goals

- **No** se carga ningún reporte. No hay `HttpClient`, ni `EXPENSE_REPORT_REPOSITORY`, ni modelo de dominio: el estado vacío es un `signal` con un `TODO` que marca el punto de inyección.
- **No** se construye la tabla de reportes. El kit solo dibuja su cabecera de columnas; las filas, la paginación y el ordenamiento son del spec de listado de reportes.
- **No** se implementa «Nuevo reporte de gastos» ni «Ver todos»: sus rutas no existen todavía (ver requisitos 4 y 9).
- **No** se maqueta el sidebar, la topbar ni la barra inferior: son de `dashboard-layout` (SPEC 04).
- **No** se toca `shared/ui/`, `dashboard.routes.ts`, `core/expense-report/` ni ningún archivo fuera de la carpeta de esta página.
- **No** se crea `features/dashboard/ui/`: ninguna pieza de esta pantalla se comparte con otra del área, porque hoy no hay otra.
- **No** se implementan notificaciones, búsqueda ni filtros.

## Dependencies

- **SPEC 04.** El `<main>` del dashboard (ancho máximo 1180 px, `p-10` / `gap-8` en escritorio y `pt-6 px-5 pb-28` / `gap-[22px]` en móvil) y el contrato de landmarks: esta página **no** emite `<main>`, `<header>`, `<nav>` ni `<aside>`, y **sí** emite el único `<h1>`.
- **SPEC 03.** `bb-stat-card` (`label`, `value`, `unit`, `highlight`), `bb-card` (`heading`, slot `[bbCardAction]`), `bb-empty-state` (`icon`, `title`, `text`), `bb-step` (`number`, `title`, `text`), `button[bb-button]` (`size="md"`, `fit="block-mobile"`) y `bb-icon`. Iconos del registro: `plus`, `report`.
- **`references/viaticos-bambu-kit/screens/04-dashboard.html` + `app.css`** (bloques «Encabezado de página», «Tarjetas» y su `@media`) y **`referencia-diseno/MovilDashboard.dc.html`** (solo lectura).

## Functional requirements

1. El contenido es una columna con cuatro bloques: encabezado de página, resumen, tarjeta de reportes recientes y pasos.
2. El encabezado de página es una fila con `justify-between`, `items-end`, `gap-5` y `flex-wrap`: a la izquierda el título y su párrafo, a la derecha el botón de acción.
3. El título es `<h1>Hola, <span class="text-bb-green italic">{{ firstName() }}</span></h1>` a `text-bb-h2 font-bold leading-[1.15]`, que baja a 26 px por debajo de `md:` (ojo: las pantallas de auth bajan a 28, esta a 26), seguido de «Este es el resumen de tus viáticos.» a `text-base text-bb-text-muted`.
4. El botón de acción es `<button bb-button type="button" size="md" fit="block-mobile">` con `<bb-icon name="plus" [size]="18" />` y «Nuevo reporte de gastos». Es un `<button>`, no un `<a routerLink>`, porque la ruta de alta no existe: enlazarla caería en el `path: '**'` y acabaría en `/login`. Lleva un `TODO` de una línea donde se convertirá en enlace.
5. `firstName` es un `signal` privado con `'Juan Manuel'` y un `TODO` que marca el punto de inyección del servicio de sesión.
6. El resumen es un `<section aria-label="Resumen">` en rejilla `repeat(auto-fit, minmax(200px, 1fr))` con `gap-4`, que por debajo de `md:` pasa a dos columnas fijas con `gap-3`.
7. Los cuatro contadores se renderizan con `@for` sobre una estructura de datos privada de la página, en este orden y con estos valores de maqueta: «Borradores» 0, «En revisión» 0, «Aprobados» 0, y «Por reembolsar» `$0.00` con unidad `MXN` y `highlight` en `true`.
8. La tarjeta es `<bb-card heading="Reportes recientes">`, y en su slot `[bbCardAction]` va «Ver todos».
9. «Ver todos» se renderiza como `<span aria-disabled="true">` con el aspecto del enlace del kit (`text-sm text-bb-green`, sin subrayado), **no** como `<a>`: su destino no existe, y anunciar un enlace que no lleva a ninguna parte es peor que no anunciarlo. Misma regla que los destinos pendientes del menú en SPEC 04.
10. Dentro de la tarjeta, la cabecera de columnas reproduce el `.table-head` del kit: rejilla de cinco columnas `1fr 2fr 1fr 1fr 1fr`, ancho mínimo 640 px dentro de un contenedor con scroll horizontal propio, `gap-4`, `px-6 py-3`, `text-xs font-bold tracking-[0.08em] text-bb-text-subtle`, borde inferior `bb-surface-2`, y los rótulos FOLIO, VIAJE / CONCEPTO, FECHA, MONTO, ESTATUS. **Está oculta por debajo de `md:`.**
11. Mientras no haya reportes, esa cabecera se marca `aria-hidden="true"`: visualmente es parte de la maqueta, pero no encabeza ninguna fila y para un lector de pantalla es solo ruido. Cuando el spec de listado traiga filas, se convertirá en una `<table>` de verdad y el atributo desaparece.
12. El estado vacío es `<bb-empty-state icon="report" title="Aún no tienes reportes" text="Crea tu primer reporte para registrar los gastos de tu viaje y enviarlos a aprobación." />`, y se renderiza bajo `@if` de un `hasReports` que hoy es `signal(false)` con un `TODO` que marca el punto de inyección del repositorio.
13. El bloque de pasos es un `<section aria-label="Cómo funciona">` en rejilla `repeat(auto-fit, minmax(240px, 1fr))` con `gap-4`, **oculto por debajo de `md:`**, con tres `<bb-step>`: 1 «Crea el reporte» / «Indica el viaje, las fechas y el proyecto o cliente.»; 2 «Sube tus comprobantes» / «Agrega cada gasto con su factura (XML y PDF) o ticket.»; 3 «Envíalo a aprobación» / «Da seguimiento al estatus hasta tu reembolso.».
14. Los tres pasos se renderizan con `@for` sobre una estructura de datos privada de la página, no como tres bloques repetidos a mano.
15. La plantilla vive en `home.html`, junto al `.ts`, con ruta relativa.
16. El componente conserva su selector `app-home`, su clase `Home` y su archivo `home.ts`.

## Interfaces & contracts

N/A — la pantalla no exporta nada importable. Su clase solo la referencia el `loadComponent` ya declarado en `dashboard.routes.ts`; sus estructuras de datos (contadores y pasos) son `private`/`protected` y deliberadamente **no** se exportan: el día que los contadores vengan del repositorio, el tipo lo definirá `core/expense-report/`, no esta página. No introduce rutas, assets, tokens ni chunks nuevos.

## Edge cases

- **Primer ingreso, sin reportes.** Es el estado que retrata la maqueta y el único que este spec implementa: cuatro ceros, estado vacío y pasos.
- **Pulsar «Nuevo reporte de gastos».** No ocurre nada, a propósito (requisito 4). Es un botón real, focalizable y con su aspecto final; lo que falta es su destino, no su maqueta.
- **Un contador con un valor largo** (`$1,234,567.89`). `bb-stat-card` hace wrap en vez de truncar (SPEC 03) y la tarjeta crece: un monto recortado con elipsis es peor que una tarjeta más alta.
- **Un contador en cero.** No hay caso especial: se renderiza como cualquier otro valor. Es, de hecho, el único que existe hoy.
- **La cabecera de columnas en pantallas estrechas de escritorio** (por ejemplo, 820 px con el sidebar de 248 px). Su ancho mínimo de 640 px dispara el scroll horizontal **dentro de la tarjeta**, no en la página. Es el comportamiento del kit.
- **La cabecera de columnas en móvil.** No se renderiza, y el estado vacío ocupa toda la tarjeta.
- **El bloque de pasos en móvil.** No se renderiza. Es contenido de ayuda, no esencial, y el kit lo oculta para no empujar la tarjeta fuera de la primera pantalla.
- **Texto al 200 % y ancho de 320 px.** El botón pasa a ancho completo y 52 px de alto por su `fit="block-mobile"`; las tarjetas de resumen en dos columnas hacen wrap de su etiqueta; no aparece scroll horizontal en la página.
- **Nombre de usuario vacío.** El título queda «Hola, » con el resto en verde vacío. No se añade lógica de saludo alternativo: cuando el dato venga de la sesión, su ausencia será un caso del spec de autenticación.
- **Concurrencia, dependencias caídas, timeouts, permisos.** N/A — la pantalla no hace I/O. Que `/dashboard` sea accesible sin sesión es un non-goal conocido de SPEC 04.

## Acceptance criteria

- [ ] Dado `/dashboard` a 1280 px, dentro del `<main>` se ve, en orden: «Hola, _Juan Manuel_» con el nombre en verde cursiva, su párrafo, el botón verde con el signo de más a la derecha de la fila; las cuatro tarjetas de resumen con la última en borde verde, valor verde y «MXN»; la tarjeta «Reportes recientes» con «Ver todos» a la derecha, la fila de rótulos de columnas y el estado vacío con el cuadro verde; y los tres pasos numerados.
- [ ] Dado `/dashboard` a 390 px, el título baja a 26 px, el botón ocupa todo el ancho con 52 px de alto, las tarjetas de resumen quedan en dos columnas, y **no** se renderizan ni la fila de rótulos ni el bloque de pasos.
- [ ] `document.querySelectorAll('h1')` devuelve exactamente un elemento, y su `textContent` es «Hola, Juan Manuel».
- [ ] La página no contiene ningún `<main>`, `<header>`, `<nav>` ni `<aside>` propio; el `<h2>` de la tarjeta lo emite `bb-card` y no hay saltos de nivel de encabezado.
- [ ] Las cuatro tarjetas se generan con `@for` sobre una sola estructura de datos, verificable porque cambiar un valor ahí cambia la tarjeta sin tocar la plantilla.
- [ ] Con `hasReports` en `false`, se renderiza el estado vacío y la fila de rótulos lleva `aria-hidden="true"`.
- [ ] «Ver todos» no es alcanzable con teclado y un lector de pantalla no lo anuncia como enlace.
- [ ] Pulsar «Nuevo reporte de gastos» no cambia la URL ni produce ningún error en consola.
- [ ] Las dos `<section>` llevan su `aria-label` («Resumen» y «Cómo funciona») y AXE sobre `/dashboard` reporta 0 violaciones.
- [ ] Comparada contra `screens/04-dashboard.html` lado a lado, no hay diferencias de espaciado, tamaño de fuente ni color en ninguno de los dos breakpoints.
- [ ] `pnpm build` sigue listando el chunk `home`, `pnpm test` termina sin errores y `npx prettier --check` sobre los archivos tocados pasa.
- [ ] `git diff --name-only` solo toca `src/app/features/dashboard/pages/home/**` y este spec.

## Risks

- **La cabecera de columnas es una tabla que no existe.** Se maqueta como rejilla de `<span>` porque el kit la dibuja así y porque sin filas una `<table>` sería peor. El spec de listado tendrá que sustituirla —no ampliarla— por una `<table>` con `<thead>`, `<th scope="col">` y filas. Queda anotado aquí para que no se herede la rejilla por inercia.
