# SPEC 03 — Primitivos del design system en `shared/ui/`

> **Status:** Implemented — commit 56ef153 en `feature/shared-ui-primitives-catalog` (pendiente de PR)
> **Depends on:** SPEC 01 (tema Tailwind), SPEC 02 (estructura por capas)
> **Date:** 2026-10-08
> **Objective:** Construir los 18 primitivos agnósticos de negocio del kit de diseño en `src/app/shared/ui/`, con su catálogo visual en `/ui-kit`, para que las pantallas se armen componiendo componentes en vez de recortando CSS de las maquetas.

## Context

SPEC 01 dejó los tokens disponibles como utilidades de Tailwind y SPEC 02 dejó las seis páginas como stubs de un `<h1>`. Entre las dos quedó un hueco: `src/app/shared/ui/index.ts` es un barrel con `export {}` y un comentario que dice que "el primer `bb-button` lo crea el spec de la pantalla que lo necesite".

Ese orden es el problema. Las cinco pantallas de auth comparten literalmente el mismo botón, el mismo input, el mismo callout y el mismo círculo de estatus —`references/viaticos-bambu-kit/screens/auth.css` los define una sola vez y las cinco maquetas los reutilizan—, y el dashboard repite el botón y los iconos con otra medida. Si el primitivo nace dentro del spec de Login, las otras cuatro pantallas heredan decisiones tomadas para una sola de ellas, o peor, cada una recorta su propia variante del mismo CSS. El kit ya resolvió qué es compartido: este spec solo traduce esa frontera a componentes Angular antes de que exista la primera pantalla que la cruce.

## Goals

1. Las 18 piezas visuales que `auth.css` y `app.css` definen una vez y reutilizan en dos o más pantallas existen como componentes standalone con selector `bb-*` bajo `src/app/shared/ui/`, exportadas por el único barrel del proyecto.
2. Ninguno de los 18 componentes importa nada de `core/`, de `features/` ni de `layouts/`: el grafo de dependencias de `shared/ui/` apunta solo a `@angular/*` y a `shared/`.
3. `bb-input` y `bb-checkbox` se conectan a un `FieldTree` de `@angular/forms/signals` con `[field]` sin que la página escriba un solo `ControlValueAccessor`, y `bb-field` cablea `for`/`id`/`aria-describedby`/`aria-invalid` sin que la página los repita.
4. La ruta lazy `/ui-kit` renderiza cada componente en todos sus estados declarados y pasa AXE sin violaciones, con los 44 px de touch target y el anillo de foco verde verificables a ojo contra `screens/*.html`.
5. `pnpm build` sigue produciendo los diez chunks lazy de SPEC 02 más `ui-kit-routes` y `catalog`, y `pnpm test` termina sin errores.

## Non-goals

- **No** se implementa ninguna de las seis páginas ni de los dos layouts. Login, Olvidé mi contraseña, Correo enviado, Restablecer, Contraseña actualizada e Inicio siguen siendo el `<h1>` que dejó SPEC 02, y `auth-layout`/`dashboard-layout` siguen siendo un `<router-outlet />`. El catálogo `/ui-kit` no es una pantalla del producto.
- **No** se construyen las piezas acopladas a un contexto. Quedan fuera y pertenecen al spec de su área: el medidor de fortaleza (`.meter`) y la lista de política de contraseña (`.rules`) → `features/auth/ui/`; el menú lateral (`.nav__link`), la barra inferior móvil (`.tab`), la topbar y el bloque de usuario → los layouts.
- **No** se construye el panel de marca de auth (`.auth__brand`, `.badge` + `.display` + `.rule` + `.lead` + `.auth__foot`) como componente. Es el layout de auth; `bb-badge` sí se construye porque es la única pieza de ese bloque que el kit vuelve a usar fuera de él.
- **No** se copia `fondo-auth.webp/.jpg`: es el fondo del panel de marca, lo copiará el spec del layout de auth. Sí se copia el logo, porque `bb-logo` lo necesita.
- **No** se convierten en componentes las clases tipográficas y de maquetación (`.h2`, `.display`, `.muted`, `.small`, `.accent`, `.rule`, `.eyebrow`, `.panel`, `.stack`, `.head`, `.page-head`, `.field__row`). Son composiciones de utilidades que cada página escribe en su plantilla. Convertirlas en `@utility` de Tailwind es un spec posterior si la repetición lo justifica; hoy no hay una sola página escrita que lo demuestre.
- **No** se crean `.back` (el enlace "Volver al inicio de sesión") ni `.link`: el primero aparece en una sola pantalla y el segundo es un `<a>` con dos utilidades.
- **No** se agrega ninguna dependencia nueva al `package.json`. Los iconos se extraen del kit, no se instalan.
- **No** se toca `src/styles/theme.css` ni `src/styles.css`: si un componente necesita un valor que el tema no expone, se reporta como hueco de SPEC 01, no se parcha aquí.
- **No** se implementa modo claro, animaciones, ni variantes de marca: el tema es único y fijo.

## Dependencies

- **SPEC 01 — Implemented (PR #1).** Se consumen exactamente estas utilidades del `@theme`, sin hardcodear ningún hex: `bg-bb-surface`, `bg-bb-surface-2`, `bg-bb-green`, `bg-bb-green-hover`, `border-bb-border`, `border-bb-border-subtle`, `border-bb-green`, `text-bb-text`, `text-bb-text-2`, `text-bb-text-muted`, `text-bb-text-subtle`, `text-bb-placeholder`, `text-bb-warning`, `text-bb-on-green`, `text-bb-h2`, `text-bb-xs`, `text-bb-badge`, `tracking-bb-badge`, `min-h-bb-control`, `min-h-bb-touch`. El anillo de foco `:focus-visible` ya es regla global en `src/styles.css`; ningún componente lo redefine.
- **SPEC 02 — Implemented (rama `chore/architecture-scaffold-layers`).** Se usan: la carpeta `src/app/shared/ui/` con su barrel `index.ts`, la convención de nombres sin sufijo (`button.ts`, no `button.component.ts`), el prefijo `bb-` reservado para esta capa, y el contrato de orden de `app.routes.ts` —la ruta `ui-kit` se declara antes del `path: ''` de auth—.
- **`@angular/forms` ^22.2.0 (ya instalado).** Se consume el subpaquete `@angular/forms/signals`, concretamente las interfaces `FormValueControl<TValue>` y `FormCheckboxControl` y el tipo `ValidationError.WithOptionalFieldTree`, verificadas en `node_modules/@angular/forms/types/signals.d.ts` (`@publicApi 22.0`). Hoy nada del proyecto importa `@angular/forms`; este spec es el primero.
- **`@angular/common` ^22.2.0 (ya instalado).** `NgOptimizedImage` para `bb-logo`.
- **`references/viaticos-bambu-kit/` (solo lectura).** Fuente de los 23 paths de SVG, de las medidas de cada componente y del logo. No se referencia en tiempo de ejecución: lo que se use se copia a `public/`.

## Functional requirements

### Assets

1. El logo se copia de `references/viaticos-bambu-kit/assets/img/logo-bambu-blanco.png` a `public/img/`. El archivo de origen es, pese a su extensión, un **JPEG de 2000×741 sin canal alfa y con fondo negro opaco** (verificado con `file`), así que se publica con su extensión real: `public/img/logo-bambu.jpg`.
2. Antes de publicarlo se reescala a **528×196 px** (misma relación 2.699:1), que es 3× el mayor ancho de render del kit (176 px en el panel de marca de escritorio), para que `NgOptimizedImage` no emita su advertencia de imagen sobredimensionada.

### `bb-icon` — registro de iconos

3. `bb-icon` recibe `name` (obligatorio) y `size` (número en px, default `20`) y renderiza un `<svg>` de `24 24` de viewBox con `fill="none"`, `stroke="currentColor"`, `stroke-linecap="round"` y `stroke-linejoin="round"`, tal como el kit.
4. El registro vive en un único archivo del propio `bb-icon` y contiene los **23** iconos extraídos del kit, con estos nombres: `mail`, `lock`, `eye`, `eye-off`, `arrow-right`, `arrow-left`, `shield-check`, `key`, `send`, `mail-check`, `clock`, `list`, `check`, `circle`, `user`, `home`, `file-text`, `plus-circle`, `help-circle`, `log-out`, `bell`, `plus`, `report`. Se extraen los 23 de una vez, aunque algunos solo los consuman specs posteriores (nav, tabbar), porque el registro es la única fuente de verdad y una extracción parcial garantiza un segundo pase sobre el mismo archivo.
5. El `stroke-width` es parte de la definición de cada icono en el registro, no un input: el kit usa `1.8` para la mayoría, `2` para las flechas y `2.4` para el check del círculo de estatus.
6. `bb-icon` renderiza con `aria-hidden="true"` siempre. Un icono que deba anunciarse se acompaña del texto de su contenedor (`bb-button`, `bb-chip`) o del `aria-label` de su contenedor (`bb-icon-button`); `bb-icon` nunca es el portador del nombre accesible.
7. Ningún otro componente de `shared/ui/` escribe un `<svg>` en su plantilla: todos pasan por `bb-icon`.

### Controles

8. `bb-button` usa selector de atributo `button[bb-button], a[bb-button]`, de modo que el consumidor decide el elemento nativo y `routerLink`, `type`, `disabled` y `href` siguen siendo atributos nativos.
9. `bb-button` expone `variant` (`'primary' | 'secondary'`, default `'primary'`), `size` (`'md' | 'lg'`, default `'lg'`) y `fit` (`'inline' | 'block' | 'block-mobile'`, default `'block'`). `lg` = 52 px de alto y 16 px de texto (botones de auth); `md` = 48 px y 15 px (botón del dashboard); `block-mobile` = ancho completo, 52 px y 16 px por debajo de 768 px, y el `size` declarado de 768 px hacia arriba, que es exactamente la regla `.page-head .btn` de `app.css`.
10. Las tres combinaciones que el kit usa hoy son `lg`/`block` primario, `lg`/`block` secundario y `md`/`block-mobile` primario. El componente no ofrece más variantes que las que el kit define.
11. El alto de todo control se expresa con `min-height`, nunca con `height`, pese a que el kit use `height`: con el texto al 200 % un `height` fijo recorta el contenido (WCAG 1.4.4).
12. `bb-icon-button` usa selector `button[bb-icon-button]`, mide 44×44 px (`--bb-touch`) y expone `variant` (`'ghost' | 'outlined'`, default `'ghost'`): `ghost` es el botón de ojo dentro del input (sin borde), `outlined` es el de la topbar (borde `bb-border`, que pasa a `bb-green` en hover junto con el color).
13. `bb-input` implementa `FormValueControl<string>`: expone `value` como `model<string>('')` y **no** declara ningún miembro `checked`. Implementa además los miembros opcionales `invalid`, `errors`, `disabled`, `required` y `name` como `input()`, y `touch` como `output<void>()` emitido en el `blur` nativo, para que la directiva `[field]` los mantenga sincronizados sola.
14. `bb-input` expone también `type` (default `'text'`), `placeholder`, `autocomplete`, `icon` (un `name` de `bb-icon`, opcional) y `status` (`'default' | 'error' | 'ok'`, default `'default'`).
15. El `<input>` interno siempre tiene `font-size: 16px`, incluso cuando el diseño pida un texto menor, para que iOS no haga zoom automático al enfocar (lo documenta el README del kit).
16. Cuando `icon` está presente, el input reserva 48 px de padding izquierdo y el icono se posiciona a 16 px del borde con `pointer-events: none` y color `bb-placeholder`.
17. `bb-input` proyecta un slot de acción al final del control. Su presencia se detecta con una consulta `contentChild` sobre el atributo marcador `bbInputAction`; cuando existe, el input reserva 56 px de padding derecho. Ese slot es donde las páginas de auth meterán su `bb-icon-button` de mostrar/ocultar contraseña — el toggle en sí no es parte de este spec.
18. `bb-checkbox` implementa `FormCheckboxControl`: expone `checked` como `model<boolean>(false)` y **no** declara ningún miembro `value`. Su etiqueta llega por proyección de contenido, el `<label>` envuelve al `<input type="checkbox">` y el bloque completo mide al menos 44 px de alto.
19. `bb-field` agrupa etiqueta, control y mensaje: expone `label` (obligatorio), `hint` opcional, y proyecta un slot `[bbFieldAction]` que se alinea a la derecha de la etiqueta en la misma línea (es el `¿Olvidaste tu contraseña?` de Login).
20. `bb-field` genera un id único por instancia, lo provee por DI a través de su propia clase y `bb-input`/`bb-checkbox` lo inyectan con `{ optional: true }` para resolver su `id`, el `for` de la etiqueta, el `aria-describedby` que apunta al mensaje y el `aria-invalid`. Un `bb-input` usado fuera de un `bb-field` cae a su propio `id` de entrada y no rompe.
21. `bb-form-message` expone `tone` (`'error' | 'ok'`) y renderiza 13 px en `bb-warning` o `bb-green`. Cuando `tone` es `'error'` lleva `role="alert"`.
22. El estado de error **nunca** se comunica solo por color: además del borde `bb-warning`, el control lleva `aria-invalid="true"` y un `bb-form-message` asociado por `aria-describedby` (WCAG 1.4.1).

### Presentación

23. `bb-badge` renderiza su contenido proyectado con borde verde de 1.5 px, 12 px de texto, `tracking-bb-badge` y peso 700, sin radio.
24. `bb-chip` renderiza un `icon` opcional más contenido proyectado en una píldora con fondo `bb-surface` y borde `bb-border-subtle`; el icono va en `bb-green` y el texto en `bb-text-2`.
25. `bb-note` es el callout de aviso: `icon` (default `shield-check`), fondo `bb-surface`, borde `bb-border-subtle`, radio 6 px, icono verde alineado arriba y contenido proyectado en 14 px `bb-text-muted`.
26. `bb-icon-tile` es el cuadro de 56×56 px con borde verde de 1.5 px, radio 8 px y fondo `bb-surface`. Cubre tanto `.tile` como `.empty__icon`, que en el kit son la misma caja declarada dos veces.
27. `bb-status-circle` es el círculo relleno de 64×64 px en `bb-green` con el icono en `bb-on-green`.
28. `bb-card` expone `heading` y proyecta un slot `[bbCardAction]` para el enlace de la derecha del encabezado y el contenido en el cuerpo. El encabezado solo se renderiza si `heading` tiene valor.
29. `bb-stat-card` expone `label`, `value`, `unit` opcional y `highlight` (default `false`). En `highlight` el borde pasa a verde de 1.5 px, la etiqueta a `bb-text-2` y el valor a `bb-green`.
30. `bb-empty-state` expone `icon`, `title` y `text`, y compone el `bb-icon-tile` con el texto centrado y un ancho máximo de 420 px.
31. `bb-step` expone `number`, `title` y `text`, con el número en un círculo verde de 32 px.
32. `bb-avatar` expone `name` y deriva las iniciales: dos letras tomadas de la primera y la última palabra del nombre, en mayúsculas; si el nombre tiene una sola palabra, una letra. Mide 40 px, borde verde de 1.5 px, y lleva `aria-hidden="true"` porque el nombre completo siempre se renderiza a su lado.
33. `bb-logo` usa `NgOptimizedImage` sobre `/img/logo-bambu.jpg` con `alt="Bambú Tech Services"`, expone `width` (default `176`, el alto se deriva de la relación 2.699:1) y `priority` (default `false`).
34. `bb-logo` solo es válido sobre un fondo `bb-black`: el archivo no tiene transparencia y su fondo negro opaco dibujaría un rectángulo visible sobre cualquier otra superficie. El componente lo documenta en su JSDoc y el spec del layout de dashboard debe usar `bb-black` en vez del `#0A0A0A` crudo que trae `app.css`.
35. `shared/ui/index.ts` exporta los 18 componentes y los tipos públicos (`BbIconName`, `BbButtonVariant`, `BbButtonSize`, `BbButtonFit`, `BbInputStatus`, `BbIconButtonVariant`, `BbFormMessageTone`). Sigue siendo el único barrel del proyecto.

### Catálogo

36. Se crea el área `features/ui-kit/` con `ui-kit.routes.ts` y una página `pages/catalog/catalog.ts`, siguiendo el mismo patrón que `auth` y `dashboard`: `loadChildren` del área en `app.routes.ts`, `loadComponent` de la página en el archivo de rutas del área.
37. La ruta `ui-kit` se declara en `app.routes.ts` antes del `path: ''` de auth, con `title` en el archivo de rutas, y no usa ninguno de los dos layouts.
38. El catálogo renderiza, con un encabezado por componente, cada estado declarado en este spec: las tres combinaciones de `bb-button` por sus dos `variant` más el estado `disabled`, los dos `variant` de `bb-icon-button`, `bb-input` en `default`/`error`/`ok`/`disabled` con y sin icono y con y sin slot de acción, `bb-checkbox` marcado y sin marcar, `bb-stat-card` normal y `highlight`, los 23 iconos del registro con su nombre debajo, y una instancia de cada uno de los demás componentes.
39. El catálogo incluye un formulario mínimo de dos campos construido con `@angular/forms/signals` que enlaza un `bb-input` y un `bb-checkbox` con `[field]`, para demostrar en vivo el requisito 13 y el 18.
40. `CLAUDE.md` se actualiza en dos puntos: la lista de chunks lazy esperados suma `ui-kit-routes` y `catalog`, y la sección de arquitectura menciona que `shared/ui/` ya está poblado y que `features/ui-kit/` es un catálogo de desarrollo, no una pantalla del producto.

## Interfaces & contracts

El barrel `src/app/shared/ui/index.ts` expone:

```ts
// Iconos
export type BbIconName =
  | 'mail' | 'lock' | 'eye' | 'eye-off' | 'arrow-right' | 'arrow-left'
  | 'shield-check' | 'key' | 'send' | 'mail-check' | 'clock' | 'list'
  | 'check' | 'circle' | 'user' | 'home' | 'file-text' | 'plus-circle'
  | 'help-circle' | 'log-out' | 'bell' | 'plus' | 'report';

// bb-icon
name: InputSignal<BbIconName>          // obligatorio
size: InputSignal<number>              // default 20

// button[bb-button] / a[bb-button]
variant: InputSignal<'primary' | 'secondary'>        // default 'primary'
size:    InputSignal<'md' | 'lg'>                    // default 'lg'
fit:     InputSignal<'inline' | 'block' | 'block-mobile'>  // default 'block'

// button[bb-icon-button]
variant: InputSignal<'ghost' | 'outlined'>           // default 'ghost'
// el aria-label lo pone el consumidor; el componente no lo genera

// bb-input — implements FormValueControl<string>
value:    ModelSignal<string>                        // requerido por el contrato
checked?: undefined                                  // prohibido por el contrato
invalid:  InputSignal<boolean>                       // opcional del contrato
errors:   InputSignal<readonly ValidationError.WithOptionalFieldTree[]>
disabled: InputSignal<boolean>
required: InputSignal<boolean>
name:     InputSignal<string>
touch:    OutputRef<void>                            // emitido en blur
type:         InputSignal<string>                    // default 'text'
placeholder:  InputSignal<string>
autocomplete: InputSignal<string>
icon:         InputSignal<BbIconName | undefined>
status:       InputSignal<'default' | 'error' | 'ok'>  // default 'default'
// slot proyectado: [bbInputAction]

// bb-checkbox — implements FormCheckboxControl
checked: ModelSignal<boolean>                        // requerido por el contrato
value?:  undefined                                   // prohibido por el contrato
disabled: InputSignal<boolean>
touch:    OutputRef<void>
// etiqueta por proyección de contenido

// bb-field  (provee su propia clase por DI: controlId, describedBy, invalid)
label: InputSignal<string>                           // obligatorio
hint:  InputSignal<string | undefined>
// slot proyectado: [bbFieldAction]

// bb-form-message
tone: InputSignal<'error' | 'ok'>                    // default 'error'

// bb-badge        — solo contenido proyectado
// bb-chip
icon: InputSignal<BbIconName | undefined>
// bb-note
icon: InputSignal<BbIconName>                        // default 'shield-check'
// bb-icon-tile / bb-status-circle
icon: InputSignal<BbIconName>                        // obligatorio

// bb-card
heading: InputSignal<string | undefined>
// slot proyectado: [bbCardAction]

// bb-stat-card
label: InputSignal<string>; value: InputSignal<string | number>
unit: InputSignal<string | undefined>; highlight: InputSignal<boolean>   // default false

// bb-empty-state
icon: InputSignal<BbIconName>; title: InputSignal<string>; text: InputSignal<string>

// bb-step
number: InputSignal<number>; title: InputSignal<string>; text: InputSignal<string>

// bb-avatar
name: InputSignal<string>                            // obligatorio; las iniciales se derivan

// bb-logo
width: InputSignal<number>                           // default 176
priority: InputSignal<boolean>                       // default false
```

Contratos no-TypeScript que este spec fija:

- **Ruta pública nueva:** `GET /ui-kit` → página de catálogo, sin guard, sin layout.
- **Asset público nuevo:** `public/img/logo-bambu.jpg` (528×196, JPEG opaco). Cualquier consumidor fuera de `bb-logo` hereda la restricción de fondo del requisito 34.
- **Chunks nuevos de `pnpm build`:** `ui-kit-routes` y `catalog`. Los diez de SPEC 02 siguen intactos.
- **Convención de slots:** los atributos marcadores de proyección de esta capa son `bbInputAction`, `bbFieldAction` y `bbCardAction`. Un componente futuro que necesite proyección nombrada sigue el mismo patrón `bb<Componente><Slot>`.

## Non-functional requirements

- **Touch targets:** todo elemento interactivo mide ≥ 44×44 px (`--bb-touch`) — `bb-icon-button`, `bb-checkbox` completo y `bb-button` en cualquiera de sus tres `fit`.
- **Contraste:** las combinaciones que este spec introduce se verifican contra AA 4.5:1 para texto normal y 3:1 para elementos no textuales. Las del kit ya auditadas: `bb-text-subtle` sobre `bb-surface` = 7.98:1, `bb-placeholder` sobre `bb-surface` = 6.27:1, `bb-on-green` sobre `bb-green` = 15.3:1. Si una combinación nueva no alcanza el umbral, se reporta como hueco de SPEC 01 y no se corrige inventando un color.
- **Zoom de texto:** a 200 % de tamaño de fuente ningún control recorta su contenido (de ahí el `min-height` del requisito 11) y no aparece scroll horizontal a 320 px de ancho (WCAG 1.4.4 y 1.4.10).
- **iOS:** el `<input>` de `bb-input` se renderiza a 16 px para no disparar el zoom automático al enfocar.
- **AXE:** `/ui-kit` pasa sin violaciones. Es la única superficie donde hoy se puede medir, y por eso el catálogo es parte del alcance y no un extra.
- **Peso:** `shared/ui/` entra al chunk inicial por ser `shared`, así que los 23 iconos van en un único archivo de datos sin dependencias; no se añade ningún paquete al bundle.

## Edge cases

- **`bb-icon` con un `name` que no existe en el registro.** El tipo `BbIconName` lo impide en compilación; en tiempo de ejecución (un `name` que llegue como `string` desde datos) no renderiza nada y emite un `console.warn` solo bajo `isDevMode()`. No lanza: un icono faltante no tumba una pantalla.
- **`bb-icon-button` sin `aria-label`.** Es un botón sin nombre accesible, violación de AXE. El componente no puede inventarlo, así que emite un `console.warn` en `isDevMode()` cuando el host no tiene ni `aria-label` ni `aria-labelledby`, y el catálogo incluye el caso correcto para que sirva de ejemplo.
- **`a[bb-button]` con `disabled`.** Un ancla no admite `disabled`. El componente aplica el estilo deshabilitado, pone `aria-disabled="true"`, `tabindex="-1"` y previene el click; `href` sigue siendo responsabilidad del consumidor, que debería omitirlo. En el kit este caso no aparece —los dos anclas con `.btn` están siempre activos—, pero el contrato del selector lo hace alcanzable.
- **Dos `bb-field` con la misma etiqueta en una página.** Los ids se generan por instancia, no se derivan de `label`, así que no colisionan ni dejan dos `<label for>` apuntando al mismo control.
- **`bb-input` con `status="error"` y sin `bb-form-message`.** El `aria-describedby` no apunta a nada: `bb-field` solo lo emite cuando hay un mensaje proyectado. El borde rojo sin texto queda como violación de 1.4.1, así que el catálogo no muestra esa combinación y el JSDoc del componente la marca como no soportada.
- **`bb-input` fuera de un `bb-field`.** `inject(BbField, { optional: true })` devuelve `null` y el componente cae a su propio `id`; no hay etiqueta, y eso es responsabilidad de quien lo use así.
- **`bb-input` usado con `[field]` y con `[(value)]` a la vez.** Las dos escriben el mismo `model`, así que la última gana de forma impredecible. No se soporta: el JSDoc indica que `[field]` y `[(value)]` son mutuamente excluyentes.
- **`bb-avatar` con nombre vacío, de una sola palabra, o con acentos.** Vacío → no renderiza iniciales, solo el círculo vacío (sigue siendo `aria-hidden`). Una palabra → una inicial. Acentos → se conserva la letra acentuada en mayúscula (`Ángel` → `Á`), no se normaliza.
- **`bb-stat-card` con un valor largo.** `$1,234,567.89` a 36 px desborda la columna mínima de 200 px. El valor hace wrap en vez de truncar: truncar un monto es peor que una tarjeta más alta.
- **`bb-stat-card` con valor `0` o `'$0.00'`.** Es el estado de primer ingreso del dashboard y se renderiza igual que cualquier otro valor; no hay caso especial de "vacío".
- **`bb-card` sin `heading`.** No renderiza el bloque de encabezado ni su borde inferior; el cuerpo queda pegado al borde de la tarjeta.
- **`bb-card` con `[bbCardAction]` pero sin `heading`.** El slot no tiene dónde ir: no se renderiza. El JSDoc lo indica.
- **`bb-logo` cuando la imagen no carga.** El `alt` queda visible en blanco sobre negro, legible. `NgOptimizedImage` no requiere fallback adicional.
- **Entrada vacía en `bb-badge`, `bb-chip`, `bb-note` o `bb-card`** (contenido proyectado ausente). Renderizan su caja vacía. No se añade lógica de detección de contenido vacío: un contenedor sin contenido es un error del consumidor, visible de inmediato.
- **Acceso concurrente, dependencias caídas, timeouts y permisos.** N/A — ningún componente de esta capa hace I/O, inyecta un repositorio ni consulta sesión. Esa es precisamente la frontera que define `shared/ui/`.

## Acceptance criteria

- [ ] `src/app/shared/ui/` contiene los 18 componentes (`bb-icon`, `bb-button`, `bb-icon-button`, `bb-input`, `bb-checkbox`, `bb-field`, `bb-form-message`, `bb-badge`, `bb-chip`, `bb-note`, `bb-icon-tile`, `bb-status-circle`, `bb-card`, `bb-stat-card`, `bb-empty-state`, `bb-step`, `bb-avatar`, `bb-logo`), todos exportados por `index.ts`.
- [ ] `grep -rn "from '.*\\(core\\|features\\|layouts\\)" src/app/shared/` no devuelve nada.
- [ ] `grep -rln "<svg" src/app/shared/ui/` devuelve únicamente el archivo de `bb-icon`.
- [ ] `grep -rnE "#[0-9a-fA-F]{6}" src/app/shared/ui/` no devuelve nada: ningún hex hardcodeado, todo sale del `@theme` de SPEC 01.
- [ ] `src/app/shared/ui/index.ts` sigue siendo el único archivo `index.ts` bajo `src/app/`.
- [ ] Dado `public/img/logo-bambu.jpg`, cuando se inspecciona con `file`, entonces reporta 528×196; y al cargar `/ui-kit` la consola no muestra la advertencia de imagen sobredimensionada de `NgOptimizedImage`.
- [ ] El registro de `bb-icon` define exactamente los 23 nombres del requisito 4, y `/ui-kit` los renderiza todos con su nombre debajo.
- [ ] Dado un `bb-icon` con un `name` inexistente forzado por casting, cuando se renderiza en modo desarrollo, entonces no lanza, no pinta nada y escribe una advertencia en consola.
- [ ] Dado el formulario de `@angular/forms/signals` del catálogo, cuando se escribe en el `bb-input` enlazado con `[field]`, entonces el valor del `FieldTree` cambia; y cuando el campo queda inválido y se hace blur, el `bb-input` recibe `invalid` y expone `aria-invalid="true"`.
- [ ] Dado ese mismo formulario, cuando se marca el `bb-checkbox` enlazado con `[field]`, entonces el booleano del `FieldTree` cambia.
- [ ] `bb-input` no declara `checked` y `bb-checkbox` no declara `value`: el proyecto compila con `pnpm build`, que es donde el contrato de las dos interfaces se verifica.
- [ ] Dado un `bb-field` con etiqueta y un `bb-input` proyectado con un `bb-form-message`, cuando se inspecciona el DOM, entonces el `<label for>` apunta al `id` del input y el `aria-describedby` del input apunta al `id` del mensaje.
- [ ] Dados dos `bb-field` con la misma `label` en la misma página, cuando se inspecciona el DOM, entonces sus ids son distintos.
- [ ] Dado un `bb-input` declarado fuera de un `bb-field`, cuando se renderiza, entonces no lanza y usa su propio `id`.
- [ ] Dado un `a[bb-button]` con `disabled`, cuando se hace click, entonces no navega, y el DOM muestra `aria-disabled="true"` y `tabindex="-1"`.
- [ ] Dado `bb-avatar` con `name=""`, `name="Ángel"` y `name="Juan Manuel Galindo"`, entonces renderiza, respectivamente, nada, `Á` y `JG`.
- [ ] Dado `bb-card` sin `heading` pero con `[bbCardAction]`, cuando se renderiza, entonces no aparece ni el encabezado ni el contenido del slot.
- [ ] Dado `bb-stat-card` con `value="$1,234,567.89"` en una columna de 200 px, cuando se renderiza, entonces el monto hace wrap y la tarjeta crece en alto, sin recorte ni elipsis.
- [ ] Con el tamaño de fuente del navegador al 200 %, ningún `bb-button`, `bb-input` ni `bb-checkbox` del catálogo recorta su contenido.
- [ ] A 320 px de ancho, `/ui-kit` no produce scroll horizontal.
- [ ] Todo elemento interactivo de `/ui-kit` mide al menos 44×44 px según el inspector.
- [ ] Una corrida de AXE sobre `/ui-kit` no reporta violaciones.
- [ ] Navegando `/ui-kit` solo con teclado, cada control recibe el anillo verde de `:focus-visible` y el orden de tabulación sigue el orden visual.
- [ ] Comparando `/ui-kit` contra `screens/01-login.html`, `03-restablecer-contrasena.html` y `04-dashboard.html` abiertas en el navegador, cada primitivo coincide en alto, radio, color de borde y peso tipográfico.
- [ ] `pnpm build` produce los diez chunks de SPEC 02 más `ui-kit-routes` y `catalog`, y ningún componente de `shared/ui/` aparece en un chunk lazy en vez del inicial.
- [ ] `pnpm test` termina sin errores.
- [ ] `pnpm build` no reporta dependencias nuevas: el `package.json` quedó sin cambios.
- [ ] `CLAUDE.md` lista los dos chunks nuevos y describe `features/ui-kit/` como catálogo de desarrollo.

## Risks

- **La frontera "primitivo vs. pieza de área" se corre durante la implementación.** El síntoma sería un `bb-*` que recibe un input con vocabulario de negocio (`reportStatus`, `expenseTotal`). Mitigación: el criterio de `grep` sobre imports de `core/` no lo detecta —un `input()` de tipo `string` pasa igual—, así que la revisión del PR debe mirar los nombres de los inputs, no solo el grafo de imports.
- **El logo opaco limita dónde se puede poner la marca.** Si diseño pide el logo sobre verde o sobre una superficie que no sea negra, no alcanza con reescalar: hace falta un SVG o un PNG con alfa que el kit no incluye. Mitigación: pedirlo a diseño en cuanto aparezca el primer caso; no intentar recortar el fondo del JPEG, porque los artefactos de compresión dejan halo alrededor de los glifos.
- **`FormValueControl` / `FormCheckboxControl` son `@publicApi 22.0`, estrenadas en la versión que usa el proyecto.** Un cambio de API en un minor de Angular rompería `bb-input` y `bb-checkbox` a la vez. Mitigación: la superficie que se consume es pequeña y está enumerada en Interfaces & contracts, así que un break se localiza en dos archivos; el catálogo con su formulario en vivo es lo que lo haría evidente en el primer `pnpm start` tras un upgrade.
- **`/ui-kit` queda publicado en producción.** Es una ruta lazy, así que no pesa en el chunk inicial, pero es alcanzable por URL y expone el inventario de UI. Se acepta a sabiendas: es una herramienta interna detrás de login una vez que exista el guard, y excluirla del build de producción exigiría un `fileReplacements` sobre `app.routes.ts` que complica el build por un beneficio nulo en esta etapa. Si algún día molesta, se quita la ruta en un spec de una línea.
- **Conflicto de utilidades de Tailwind en los componentes de selector de atributo.** Un consumidor que escriba `<button bb-button class="h-10">` compite con la clase de alto del propio componente, y en Tailwind v4 gana el orden en la hoja, no la especificidad. Mitigación: `bb-button` cubre con `size` y `fit` las tres formas que el kit realmente usa, de modo que no haya motivo para sobrescribir desde fuera; si aparece una cuarta, se agrega al componente en vez de parcharse desde la página.

## Open questions

- **Tests unitarios.** El spec entrega los componentes y el catálogo, sin archivos `.spec.ts` propios: varios criterios de aceptación de arriba están redactados como aserciones de DOM (ids, `aria-invalid`, iniciales, `a[bb-button]` deshabilitado) y son automatizables, pero no se decidió si se automatizan aquí o en un spec de testing que cubra toda la capa de una vez. Hace falta resolverlo antes de aprobar: si la respuesta es "aquí", cambia el alcance y los criterios; si es "después", hay que nombrar el spec que lo recoge.
- **Cómo se corre AXE.** Varios criterios dependen de "una corrida de AXE sobre `/ui-kit`", pero el proyecto no tiene hoy ninguna herramienta de accesibilidad instalada ni script que la invoque. Falta decidir si basta con la extensión de navegador ejecutada a mano durante la revisión del PR, o si este spec debe dejar instalado algo que lo corra en CI — lo segundo agregaría la dependencia que el Non-goal de `package.json` prohíbe, así que las dos opciones se contradicen y alguien tiene que elegir.
