# SPEC 01 — Tema de Tailwind a partir de los tokens de diseño Bambú

> **Status:** Implemented — PR #1
> **Depends on:** —
> **Date:** 2026-10-08
> **Objective:** Traducir los tokens de diseño del kit de referencia a un bloque `@theme` de Tailwind v4 con utilidades prefijadas `bb-`, para que las pantallas de la plataforma de viáticos se implementen con clases de utilidad en vez de valores hardcodeados.

## Context

`bambu-viaticos` es un scaffold de Angular 22 recién inicializado con Tailwind v4 en modo CSS-first (`@import 'tailwindcss'` en `src/styles.css`, sin `tailwind.config.js`) pero sin tema propio: hoy solo existen los defaults de Tailwind. `references/viaticos-bambu-kit/` trae el kit de diseño completo del módulo de auth y el dashboard, con sus tokens canónicos en `tokens/tokens.css` y `tokens/tokens.json` (17 colores, tipografía Sansation, escalas de tamaño/espaciado/radio y medidas de control) y maquetas `screens/*.css` que ya los consumen vía `var(--bb-*)`.

Implementar hoy cualquiera de esas pantallas obligaría a hardcodear hex o a referenciar variables CSS crudas, justo lo que `CLAUDE.md` prohíbe al describir el kit como material de solo lectura del que hay que "pullear valores de los design tokens". Este spec cierra ese hueco antes de que exista una sola línea de ese código.

Un hallazgo relevante de la auditoría de tokens: buena parte del kit ya coincide numéricamente con los defaults de Tailwind v4 —la escala `--bb-space-*` (4/8/12/16/20/24/32/48/56 px) es idéntica a la escala de spacing default, `--bb-radius` 6 px y `--bb-radius-lg` 8 px equivalen a `rounded-md`/`rounded-lg`, y el breakpoint de 768 px del kit es exactamente el `md` default. El tema custom solo tiene que cubrir lo que de verdad no existe, no re-declarar lo que Tailwind ya entrega.

## Goals

1. Cada uno de los 17 colores de `tokens.css` está disponible como utilidad de Tailwind (`bg-bb-*`, `text-bb-*`, `border-bb-*`, …) con el valor exacto —hex o rgba— del token y el mismo sufijo de nombre que la variable `--bb-*` original.
2. La tipografía Sansation se sirve desde los assets del proyecto (no desde `references/`) y es la fuente que resuelve `font-sans`, reemplazando el stack default de Tailwind.
3. Toda medida del kit que **no** coincida con un default de Tailwind (tamaños display/h2/xs/badge, `line-height` 1.1, `letter-spacing` .14em, alto de control 52 px, touch target 44 px, ancho máximo de formulario 420 px) existe como utilidad propia expresada en `rem`.
4. Las coincidencias con los defaults (spacing 1–14, radios 6/8/pill, breakpoint 768 px) quedan documentadas como "ya cubiertas" en vez de duplicarse en el tema.
5. `pnpm build` y `pnpm start` compilan sin errores tras el cambio, sin que se haya creado ni modificado ningún componente de aplicación.

## Non-goals

- **No** se implementan las pantallas de auth (Login, Olvidé mi contraseña, Restablecer) ni el dashboard; eso es un spec posterior que dependerá de este.
- **No** se copian los assets visuales no tipográficos del kit (logo `logo-bambu-blanco.png`, fondo `fondo-auth.webp/.jpg`); se copiarán cuando el spec del componente que los use lo pida.
- **No** se construye un sistema multi-marca ni un toggle claro/oscuro: el tema es único y fijo (negro puro + verde neón).
- **No** se migra a `tailwind.config.js`; se mantiene el modo CSS-first ya instalado.
- **No** se audita aquí el contraste AA de cada combinación de colores del kit — eso se verifica contra UI real en los specs de pantalla, no sobre el tema en abstracto.
- **No** se optimiza la carga de la fuente (subsetting, `preload`, conversión a `woff2`): queda como posible spec futuro.

## Functional requirements

1. Copiar los 5 archivos `Sansation-*.ttf` y su `OFL.txt` desde `references/viaticos-bambu-kit/assets/fonts/` a `public/fonts/` (directorio ya declarado como asset en `angular.json`), sin modificar los binarios.
2. Declarar los 5 `@font-face` de Sansation —Light 300, Regular 400, Italic 400, Bold 700, BoldItalic 700— apuntando a `/fonts/…`, con `font-display: swap`, replicando lo que hace `tokens/tokens.css`.
3. Crear `src/styles/theme.css` con un bloque `@theme` que redefina `--font-sans` como `"Sansation", "Trebuchet MS", "Segoe UI", sans-serif`, de modo que `font-sans` y el texto sin clase explícita de fuente usen Sansation.
4. En ese mismo `@theme`, declarar una variable `--color-bb-<sufijo>` por cada color de `tokens.css`, conservando el sufijo original: `black`, `surface`, `surface-2`, `border`, `border-subtle`, `green`, `green-hover`, `green-soft`, `focus-ring`, `text`, `text-2`, `text-muted`, `text-subtle`, `placeholder`, `warning`, `caution`, `on-green`.
5. Declarar los tamaños de fuente que no existen en Tailwind: `--text-bb-display` (3.5rem / 56 px), `--text-bb-h2` (2.125rem / 34 px), `--text-bb-xs` (0.8125rem / 13 px) y `--text-bb-badge` (0.75rem / 12 px). `bb-xs` es deliberadamente distinto del `text-xs` default (12 px).
6. Declarar `--leading-bb-tight` con valor `1.1`; el `leading-tight` default de Tailwind es 1.25 y no sirve. `--bb-lh-body` (1.5) equivale a `leading-normal` y **no** se declara.
7. Declarar `--tracking-bb-badge` con valor `.14em`; el `tracking-widest` default es .1em y no sirve.
8. Exponer las tres medidas de control del kit en `rem` —alto de control 3.25rem (52 px), touch target 2.75rem (44 px), ancho máximo de formulario 26.25rem (420 px)— generando utilidades consumibles con nombre `bb-`: `h-bb-control`, `min-h-bb-touch` y `max-w-bb-form`. El contrato es el nombre de clase y el valor; el mecanismo interno de Tailwind v4 (namespace `--spacing-*` / `--container-*` o una `@utility` propia) lo elige quien implemente, verificándolo contra la documentación vigente de Tailwind v4.
9. Dejar un comentario en `src/styles/theme.css` que registre explícitamente qué tokens del kit **no** se declararon porque ya los cubre el default de Tailwind: escala `--bb-space-1…14` ↔ escala de spacing default, `--bb-radius` 6 px ↔ `rounded-md`, `--bb-radius-lg` 8 px ↔ `rounded-lg`, `--bb-radius-pill` ↔ `rounded-full`, breakpoint 768 px ↔ `md`.
10. Importar `src/styles/theme.css` (y el archivo de `@font-face`, si se deja separado) desde `src/styles.css` en el orden que Tailwind v4 requiere para que el `@theme` sea tomado en cuenta.
11. Portar a `src/styles.css` las reglas base que hoy viven en `references/.../screens/app.css` —`body` con fondo `bb-black`, color `bb-text` y fuente Sansation; links en `bb-green` con hover `bb-green-soft`; `:focus-visible` con outline verde de 2 px y offset 3 px— usando exclusivamente tokens/utilidades `bb-*`, sin un solo hex literal.

## Interfaces & contracts

El contrato que consumirán los specs de pantalla posteriores son los nombres de utilidad generados. Mapeo token → variable de tema → utilidad:

| Token del kit | Variable `@theme` | Utilidades resultantes |
|---|---|---|
| `--bb-black` `#000000` | `--color-bb-black` | `bg-bb-black`, `text-bb-black`, … |
| `--bb-surface` `#0D0D0D` | `--color-bb-surface` | `bg-bb-surface`, … |
| `--bb-surface-2` `#1F1F1F` | `--color-bb-surface-2` | `bg-bb-surface-2`, … |
| `--bb-border` `#333333` | `--color-bb-border` | `border-bb-border`, … |
| `--bb-border-subtle` `#262626` | `--color-bb-border-subtle` | `border-bb-border-subtle`, … |
| `--bb-green` `#00FF00` | `--color-bb-green` | `bg-bb-green`, `text-bb-green`, `border-bb-green`, … |
| `--bb-green-hover` `#5CFF5C` | `--color-bb-green-hover` | `hover:bg-bb-green-hover`, … |
| `--bb-green-soft` `#9CFF9C` | `--color-bb-green-soft` | `hover:text-bb-green-soft`, … |
| `--bb-focus-ring` `rgba(0,255,0,.18)` | `--color-bb-focus-ring` | `ring-bb-focus-ring`, `shadow-bb-focus-ring`, … |
| `--bb-text` `#FFFFFF` | `--color-bb-text` | `text-bb-text`, … |
| `--bb-text-2` `#CCCCCC` | `--color-bb-text-2` | `text-bb-text-2`, … |
| `--bb-text-muted` `#B3B3B3` | `--color-bb-text-muted` | `text-bb-text-muted`, … |
| `--bb-text-subtle` `#A6A6A6` | `--color-bb-text-subtle` | `text-bb-text-subtle`, … |
| `--bb-placeholder` `#8A8A8A` | `--color-bb-placeholder` | `placeholder:text-bb-placeholder`, … |
| `--bb-warning` `#FFB27A` | `--color-bb-warning` | `text-bb-warning`, … |
| `--bb-caution` `#FFD666` | `--color-bb-caution` | `text-bb-caution`, … |
| `--bb-on-green` `#000000` | `--color-bb-on-green` | `text-bb-on-green` (texto sobre botón verde) |
| `--bb-font` | `--font-sans` (reemplazo) | `font-sans` → Sansation |
| `--bb-fs-display` 56px | `--text-bb-display` `3.5rem` | `text-bb-display` |
| `--bb-fs-h2` 34px | `--text-bb-h2` `2.125rem` | `text-bb-h2` |
| `--bb-fs-xs` 13px | `--text-bb-xs` `0.8125rem` | `text-bb-xs` |
| `--bb-fs-badge` 12px | `--text-bb-badge` `0.75rem` | `text-bb-badge` |
| `--bb-lh-tight` 1.1 | `--leading-bb-tight` | `leading-bb-tight` |
| `--bb-tracking-badge` .14em | `--tracking-bb-badge` | `tracking-bb-badge` |
| `--bb-control-h` 52px | medida `bb-control` `3.25rem` | `h-bb-control` |
| `--bb-touch` 44px | medida `bb-touch` `2.75rem` | `min-h-bb-touch`, `w-bb-touch`, `h-bb-touch` |
| `--bb-form-max` 420px | medida `bb-form` `26.25rem` | `max-w-bb-form` |

Tokens cubiertos por defaults de Tailwind, **sin** entrada nueva en el tema:

| Token del kit | Default equivalente |
|---|---|
| `--bb-space-1…14` (4/8/12/16/20/24/32/48/56 px) | escala de spacing default (`p-1`…`p-14`) |
| `--bb-fs-body-lg` 18px / `--bb-fs-body` 16px / `--bb-fs-sm` 14px | `text-lg` / `text-base` / `text-sm` |
| `--bb-lh-body` 1.5 | `leading-normal` |
| `--bb-radius` 6px / `--bb-radius-lg` 8px / `--bb-radius-pill` | `rounded-md` / `rounded-lg` / `rounded-full` |
| Breakpoint 768 px del kit | `md:` |

Archivos que este spec crea o modifica (contrato estructural para specs posteriores):

- `public/fonts/Sansation-*.ttf` + `public/fonts/OFL.txt` (nuevos)
- `src/styles/theme.css` (nuevo) — bloque `@theme` + comentario de tokens cubiertos por defaults
- `src/styles.css` (modificado) — imports, `@font-face` y capa base
- `references/viaticos-bambu-kit/**` — **solo lectura**, no se modifica

## Non-functional requirements

- Todos los tamaños de fuente y medidas custom se expresan en `rem` sobre base 16 px, para que el texto escale con la configuración de tamaño de fuente del navegador (WCAG 2.1 AA, criterio 1.4.4 Resize text), aun cuando el kit los exporte en px.
- El input del kit usa 16 px de fuente para evitar el zoom automático de iOS al enfocar; el tema debe preservar esa equivalencia (`text-base` = 1rem = 16 px), no reducirla.
- `font-display: swap` se mantiene en los 5 `@font-face` para que el texto sea legible antes de que Sansation termine de cargar.

## Edge cases

- **Un componente futuro necesita un color que no está en el kit** (p. ej. un rojo de error distinto de `--bb-warning`): no se agrega token especulativo aquí; lo agrega el spec del componente que lo justifique.
- **`--bb-focus-ring` es rgba con alfa y en el kit se usa como halo, mientras `app.css` usa outline verde sólido para `:focus-visible`**: este spec solo expone el color como `--color-bb-focus-ring`; qué utilidad lo aplica (`ring-*`, `shadow-*` u `outline-*`) lo decide el spec de la pantalla que lo use. La capa base sí porta el `outline` verde sólido del requisito 11.
- **Tailwind v4 no soporta nombrar entradas custom en el namespace asumido del requisito 8**: se resuelve con el mecanismo que sí soporte (p. ej. `@utility`), manteniendo idénticos el nombre de clase final y el valor en rem. El valor es el contrato, no el namespace.
- **`text-bb-xs` (13 px) vs `text-xs` default (12 px)**: conviven; el default no se sobreescribe para no romper la escala estándar de Tailwind. Quien implemente pantallas debe usar `text-bb-xs` cuando el mockup pida 13 px.
- **Los `.ttf` no cargan** (red lenta, bloqueo de fuentes): `font-display: swap` más el stack de respaldo `Trebuchet MS, Segoe UI, sans-serif` cubren el caso; no se agrega mitigación adicional.
- **Angular regenera `src/styles.css` o se corre un `ng update`**: el tema vive en `src/styles/theme.css` precisamente para que `styles.css` quede mínimo (imports + capa base) y un conflicto de merge sea trivial.

## Acceptance criteria

- [ ] Existen utilidades de color (`bg-`, `text-`, `border-`, …) para los 17 tokens de `tokens.css`, con el valor exacto hex/rgba de cada uno y el sufijo `bb-<nombre-original>`.
- [ ] `font-sans`, y el texto sin clase de fuente explícita, renderizan en Sansation; los 5 `@font-face` cargan desde `/fonts/` con `font-display: swap`.
- [ ] Los `.ttf` y el `OFL.txt` están en `public/fonts/`, y ningún estilo de la app referencia rutas dentro de `references/`.
- [ ] Existen `text-bb-display` (3.5rem), `text-bb-h2` (2.125rem), `text-bb-xs` (0.8125rem) y `text-bb-badge` (0.75rem), todos en rem.
- [ ] Existen `leading-bb-tight` (1.1) y `tracking-bb-badge` (.14em).
- [ ] Existen utilidades equivalentes a `h-bb-control` (3.25rem), `min-h-bb-touch` (2.75rem) y `max-w-bb-form` (26.25rem), todas en rem.
- [ ] `src/styles/theme.css` contiene el comentario que lista los tokens no declarados por estar cubiertos por defaults (spacing 1–14, radios 6/8/pill, breakpoint 768 px).
- [ ] `src/styles.css` define `body` (fondo, color, fuente), color de links con hover y `:focus-visible` usando solo tokens `bb-*` — sin ningún hex o rgba literal en el archivo.
- [ ] `pnpm build` y `pnpm start` terminan sin errores de PostCSS/Tailwind.
- [ ] Una página de prueba descartable (o la inspección del CSS generado) confirma que `bg-bb-green` produce `#00FF00` y `h-bb-control` produce 52 px de alto; la prueba no queda commiteada.
- [ ] `git status` confirma que no se creó ni modificó ningún componente, ruta o template de la aplicación, y que `references/viaticos-bambu-kit/` está intacto.

## Risks

- El namespace exacto de Tailwind v4 para las medidas custom del requisito 8 puede no comportarse como se asume. Riesgo bajo y totalmente reversible: cambia el mecanismo interno, no el contrato de clases.
- Reemplazar `--font-sans` globalmente cambia la tipografía de todo texto no estilizado, incluido cualquier remanente del scaffold de Angular. Hoy el blast radius es prácticamente cero porque la app no tiene pantallas propias, pero deja de serlo si este spec se implementa después de construir UI.
- Cinco `.ttf` sin subsetear suman peso a la carga inicial. No se mitiga aquí (está en Non-goals); si el presupuesto de performance se vuelve un problema, amerita su propio spec de optimización de fuentes.
