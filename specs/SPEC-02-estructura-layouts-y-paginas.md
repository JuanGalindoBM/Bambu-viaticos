# SPEC 02 — Estructura de archivos: capas, layouts y páginas

> **Status:** Implemented — rama `chore/architecture-scaffold-layers` (pendiente de PR)
> **Depends on:** —
> **Date:** 2026-10-08
> **Objective:** Levantar el esqueleto de archivos por capas de la app —`core/`, `shared/`, `layouts/`, `features/`— con dos layouts de ruta y seis páginas stub que compilan y cargan lazy, sin una sola línea de diseño.

## Context

`bambu-viaticos` sigue siendo el scaffold crudo de Angular 22: `src/app/` tiene solo `app.ts`, `app.html` (la página de bienvenida del CLI), `app.config.ts` y un `app.routes.ts` con el arreglo vacío. SPEC 01 ya dejó el tema de Tailwind listo, así que lo único que separa al proyecto de empezar a implementar pantallas es que no existe ningún lugar acordado donde ponerlas.

El producto ya está definido: dos layouts (auth y dashboard) y seis páginas —Iniciar sesión, Olvidé mi contraseña, Correo enviado, Restablecer contraseña, Contraseña actualizada, Inicio—. Sin el esqueleto, la primera pantalla que alguien escriba va a inventar su propia ubicación, su propio archivo de rutas y su propio criterio de qué es "compartido", y corregir eso después cuesta mover archivos entre capas, que es exactamente lo que cambia qué entra al chunk inicial.

La skill `angular-file-architecture` ya define la arquitectura y trae un script de scaffolding. Este spec no la reinventa: fija las **decisiones propias del proyecto** que el script toma como parámetros (prefijo, dominio, áreas) y las rutas concretas que conectan las seis páginas.

## Goals

1. El árbol de cuatro capas de la skill existe en `src/app/` —incluidas las carpetas de convención todavía vacías, marcadas con `.gitkeep`— de modo que cualquier archivo nuevo tenga una carpeta a la cual pertenecer sin crear una.
2. Las seis rutas (`/login`, `/forgot-password`, `/forgot-password/sent`, `/reset-password`, `/reset-password/done`, `/dashboard`) resuelven en el navegador y renderizan su página stub.
3. `pnpm build` produce un chunk lazy independiente por área: ni `auth` ni `dashboard` entran al chunk inicial.
4. `pnpm build` y `pnpm test` terminan sin errores, sin que quede un solo resto de la página de bienvenida del CLI.
5. `CLAUDE.md` documenta las decisiones propias del proyecto (prefijo `bb-`, dominio `expense-report`, áreas `auth` y `dashboard`, nombres de chunk esperados), no la arquitectura genérica.

## Non-goals

- **No** se implementa el diseño de ninguna pantalla: ni el layout de dos columnas de auth, ni el sidebar de 248 px del dashboard, ni la barra inferior móvil. Cada página es un `<h1>` y cada layout es un `<router-outlet>`. Las pantallas reales son specs posteriores, uno por área o por pantalla.
- **No** se crea ningún primitivo en `shared/ui/`: la carpeta queda con su barrel vacío. El primer `bb-button` lo crea el spec de la pantalla que lo necesite.
- **No** se implementa ningún guard ni servicio de sesión. `core/auth/guards/` y `core/auth/services/` quedan con `.gitkeep`, y `/dashboard` queda accesible sin sesión; el archivo de rutas solo **reserva** el lugar del `canActivate` con un comentario.
- **No** se modela el negocio: `core/expense-report/` queda con el contenido placeholder que genera el script (un `ExpenseReport { id }` y una regla de ejemplo). Modelar los estatus reales (Borrador, En revisión, Aprobado, Por reembolsar) es un spec posterior.
- **No** se implementa ningún formulario, validación, medidor de fortaleza de contraseña ni cooldown de reenvío de 45 s, aunque el kit de referencia los traiga en `auth.js`.
- **No** se conecta nada a un backend ni se escribe el `mock-expense-report.repository.ts` más allá del placeholder del script; no se registra todavía el repositorio en `app.config.ts`.
- **No** se agregan tests más allá de mantener verde la suite existente: ningún `.spec.ts` nuevo por página o layout.
- **No** se toca el tema de SPEC 01 (`src/styles/theme.css`, `src/styles.css`) ni `references/viaticos-bambu-kit/`.

## Dependencies

- `.claude/skills/angular-file-architecture/scripts/scaffold-architecture.sh` — se ejecuta desde la raíz del repo con exactamente estos parámetros:
  `--prefix bb --domain expense-report --areas auth,dashboard`
  El script nunca sobrescribe un archivo existente (imprime `skip …`), lo que lo hace seguro de correr sobre este proyecto a medio hacer.
- `@angular/router` ≥ v22 para `withComponentInputBinding()`, ya presente en las dependencias del proyecto. No se agrega ningún paquete nuevo.

## Functional requirements

### Esqueleto de capas

1. Correr el script de scaffolding con los parámetros de la sección anterior, generando `core/auth/guards/`, `core/auth/services/`, `core/interceptors/`, `shared/ui/index.ts`, `shared/directives|pipes|utils/`, `layouts/`, `features/auth/{pages,ui}`, `features/dashboard/{pages,ui}` y los cinco archivos de `core/expense-report/`.
2. Borrar del resultado las carpetas `core/models/` y `core/tokens/` que el script crea de forma genérica: en este proyecto los tipos del dominio viven en `core/expense-report/expense-report.model.ts` y el `InjectionToken` del repositorio vive junto a su interfaz en `core/expense-report/expense-report.repository.ts`. Dejarlas abiertas invita a volcar ahí tipos del dominio y partir el módulo en dos.
3. Toda carpeta de convención que quede vacía conserva su `.gitkeep`, para que el esqueleto se commitee completo.
4. `shared/ui/index.ts` queda como el **único** barrel del proyecto, con su `export {}` y el comentario que explica por qué no debe haber otro.

### Layouts

5. Crear `src/app/layouts/auth-layout/auth-layout.ts`: componente standalone, selector `app-auth-layout`, template inline que contiene únicamente `<router-outlet />`, importando `RouterOutlet`.
6. Crear `src/app/layouts/dashboard-layout/dashboard-layout.ts` con la misma forma y selector `app-dashboard-layout`.
7. Ninguno de los dos layouts declara estilos, `styleUrl`, ni estructura visual (sidebar, topbar, panel de marca): son contenedores de ruta y nada más.

### Páginas

8. Crear las cinco páginas de `auth` bajo `src/app/features/auth/pages/`, una carpeta por página, nombre de archivo y carpeta en kebab-case sin sufijo de tipo:

   | Carpeta / archivo | Clase | Selector | `<h1>` del stub |
   |---|---|---|---|
   | `login/login.ts` | `Login` | `app-login` | Iniciar sesión |
   | `forgot-password/forgot-password.ts` | `ForgotPassword` | `app-forgot-password` | Olvidé mi contraseña |
   | `forgot-password-sent/forgot-password-sent.ts` | `ForgotPasswordSent` | `app-forgot-password-sent` | Correo enviado |
   | `reset-password/reset-password.ts` | `ResetPassword` | `app-reset-password` | Restablecer contraseña |
   | `reset-password-done/reset-password-done.ts` | `ResetPasswordDone` | `app-reset-password-done` | Contraseña actualizada |

9. Crear la página del dashboard en `src/app/features/dashboard/pages/home/home.ts`, clase `Home`, selector `app-home`, `<h1>Inicio</h1>`.
10. Cada página es un componente standalone con **template inline** de una línea: el `<h1>` de la tabla y nada más. Sin `styleUrl`, sin `imports`, sin estado, sin inyecciones.
11. `ResetPassword` declara `readonly token = input<string>()` para recibir el query param del enlace del correo. El stub **no** lo lee, no lo valida y no lo renderiza: existe para fijar el contrato de la ruta y para que el binding sea verificable.

### Rutas

12. Activar `withComponentInputBinding()` en `src/app/app.config.ts`: `provideRouter(routes, withComponentInputBinding())`.
13. Reescribir `src/app/app.routes.ts` con estas cuatro entradas, en este orden exacto:

    ```ts
    { path: '', pathMatch: 'full', redirectTo: 'login' }
    { path: 'dashboard', loadChildren: () => import('./features/dashboard/dashboard.routes').then((m) => m.dashboardRoutes) }
    { path: '', loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes) }
    { path: '**', redirectTo: 'login' }
    ```

    El orden es parte del contrato: `dashboard` va antes que el `path: ''` de auth porque auth vive en la raíz y, declarado primero, se comería el prefijo.
14. `src/app/features/auth/auth.routes.ts` exporta `authRoutes` con una ruta padre `path: ''` que carga `AuthLayout` vía `loadComponent`, y cinco hijos, **en este orden**:

    | `path` | `title` | Página |
    |---|---|---|
    | `login` | Iniciar sesión | `Login` |
    | `forgot-password/sent` | Correo enviado | `ForgotPasswordSent` |
    | `forgot-password` | Olvidé mi contraseña | `ForgotPassword` |
    | `reset-password/done` | Contraseña actualizada | `ResetPasswordDone` |
    | `reset-password` | Restablecer contraseña | `ResetPassword` |

    Las rutas de dos segmentos van **antes** que su prefijo de un segmento, para no depender del backtracking del router entre hermanos.
15. `src/app/features/dashboard/dashboard.routes.ts` exporta `dashboardRoutes` con una ruta padre `path: ''` que carga `DashboardLayout` vía `loadComponent` y un único hijo `path: ''` con `title: 'Inicio'` que carga `Home`.
16. En `dashboard.routes.ts`, dejar sobre la ruta padre un comentario de una línea que reserve el lugar del guard de sesión (`// canActivate: [authGuard] — lo agrega el spec de autenticación`), sin implementarlo.
17. Toda página se carga con `loadComponent`; toda área se carga con `loadChildren`. Ningún archivo de rutas importa una página de forma estática.
18. El `title` de cada ruta se declara en el archivo de rutas, nunca dentro del componente.

### Limpieza del scaffold del CLI

19. Reemplazar el contenido de `src/app/app.html` por únicamente `<router-outlet />`, eliminando el bloque de bienvenida del CLI (el `<style>` inline, el logo SVG y los enlaces).
20. Borrar `src/app/app.css` y la referencia `styleUrl` de `src/app/app.ts`; los estilos globales ya viven en `src/styles.css` (SPEC 01) y el shell no aporta ninguno.
21. Eliminar de `src/app/app.ts` la señal `title` del scaffold, que ya no tiene consumidor.
22. Actualizar `src/app/app.spec.ts`: la prueba `should render title` afirma `'Hello, bambu-viaticos'` contra el HTML que el requisito 19 borra, así que debe reemplazarse por una que no dependa del template de bienvenida (p. ej. solo la de creación, con `provideRouter([])` en el TestBed).

### Documentación

23. Agregar a `CLAUDE.md` una sección de arquitectura que registre: el árbol de cuatro capas con su regla de pertenencia en una línea, el prefijo `bb-` para `shared/ui/` frente a `app-` para features, el dominio `expense-report`, las áreas `auth` y `dashboard`, la regla del barrel único, y los nombres de chunk lazy esperados en el build. Documenta las decisiones del proyecto, no la arquitectura genérica —para eso está la skill— y apunta a ella.

## Interfaces & contracts

**Mapa de URLs** (contrato con el backend y con el correo de recuperación):

| URL | Página | Notas |
|---|---|---|
| `/` | — | redirige a `/login` |
| `/login` | `Login` | |
| `/forgot-password` | `ForgotPassword` | |
| `/forgot-password/sent` | `ForgotPasswordSent` | |
| `/reset-password?token=XXX` | `ResetPassword` | `token` entra como `input<string>()` |
| `/reset-password/done` | `ResetPasswordDone` | |
| `/dashboard` | `Home` | |
| cualquier otra | — | redirige a `/login` |

> El `README.md` del kit documenta el enlace del correo como `…/restablecer?token=XXX`. Este spec lo fija en inglés: **`/reset-password?token=XXX`**. Es un cambio al contrato que backend debe reflejar en la plantilla del correo de recuperación.

**Símbolos exportados** que consumirán los specs posteriores:

| Archivo | Export |
|---|---|
| `src/app/app.routes.ts` | `routes: Routes` |
| `src/app/features/auth/auth.routes.ts` | `authRoutes: Routes` |
| `src/app/features/dashboard/dashboard.routes.ts` | `dashboardRoutes: Routes` |
| `src/app/layouts/auth-layout/auth-layout.ts` | `AuthLayout` |
| `src/app/layouts/dashboard-layout/dashboard-layout.ts` | `DashboardLayout` |
| `src/app/features/auth/pages/**` | `Login`, `ForgotPassword`, `ForgotPasswordSent`, `ResetPassword`, `ResetPasswordDone` |
| `src/app/features/dashboard/pages/home/home.ts` | `Home` |
| `src/app/core/expense-report/expense-report.repository.ts` | `ExpenseReportRepository`, `EXPENSE_REPORT_REPOSITORY` |
| `src/app/shared/ui/index.ts` | barrel vacío (`export {}`) |

**Convenciones que este spec fija para todo archivo futuro:**

- Dos prefijos de selector: `bb-` para los primitivos de `shared/ui/`, `app-` (el de `angular.json`) para layouts y features.
- Nombres de archivo en kebab-case, sin sufijo de tipo en componentes y páginas (`login.ts`, no `login.component.ts`). Los sufijos se reservan para `.guard.ts`, `.interceptor.ts`, `.service.ts`, `.repository.ts`, `.rules.ts`, `.model.ts`, `.routes.ts`.
- Un solo barrel en todo el proyecto: `shared/ui/index.ts`.
- `templateUrl`/`styleUrl` siempre relativos al `.ts` hermano, cuando dejen de ser inline.

**Archivos que este spec crea o modifica:**

- Nuevos: todo `src/app/{core,shared,layouts,features}/**`
- Modificados: `src/app/app.routes.ts`, `src/app/app.config.ts`, `src/app/app.html`, `src/app/app.ts`, `src/app/app.spec.ts`, `CLAUDE.md`
- Borrados: `src/app/app.css`
- Intactos: `src/styles.css`, `src/styles/theme.css`, `public/fonts/**`, `references/viaticos-bambu-kit/**`

## Non-functional requirements

- Cada página stub renderiza un `<h1>` con el nombre de la pantalla y cada ruta declara su `title`, para que la navegación sea anunciable por lector de pantalla desde el primer commit y no haya que retrofitearlo pantalla por pantalla.
- El chunk inicial del build no contiene ninguna página ni ningún layout: la verificación es la lista de chunks del output de `pnpm build`, no la lectura del código.

## Edge cases

- **Una URL desconocida** (`/cualquier-cosa`): la cae el `**` y redirige a `/login`. Decisión consciente: hoy no hay página 404 propia; cuando el producto la pida, es un spec de pantalla.
- **`/reset-password` sin `token`**: el stub renderiza igual. No valida ni redirige — esa decisión (mostrar aviso de enlace inválido, mandar a `/forgot-password`) es del spec que implemente la pantalla.
- **`/forgot-password/sent` o `/reset-password/done` entrando por URL directa**, sin haber pasado por el paso previo: se renderizan sin restricción. Bloquear el salto de paso requiere estado de flujo y no es de este spec.
- **`/dashboard` sin sesión**: entra. No hay guard (Non-goals); el requisito 16 solo reserva el lugar donde irá el `canActivate`.
- **El script de scaffolding encuentra archivos ya existentes** (`src/styles/theme.css` de SPEC 01): no los toca, imprime `skip`. Si por cualquier razón se detecta una modificación a `theme.css` o `styles.css`, el cambio se revierte: SPEC 01 está Implemented.
- **Colisión de dos `path: ''` en la raíz** (auth y dashboard): resuelta por el prefijo `dashboard` y por el orden del requisito 13. Invertir el orden rompe `/dashboard` sin que nada falle en el build.
- **La suite de tests del scaffold se rompe** al borrar la página de bienvenida: es esperado y el requisito 22 lo cubre; no se deja `pnpm test` en rojo "porque es solo el test del CLI".
- **`withComponentInputBinding()` ya activado y un futuro `:id` de ruta**: el parámetro entra como `input()`; ninguna página debe inyectar `ActivatedRoute` para leerlo.

## Acceptance criteria

- [ ] `src/app/` contiene `core/auth/guards/`, `core/auth/services/`, `core/interceptors/`, `core/expense-report/`, `shared/ui/`, `shared/directives/`, `shared/pipes/`, `shared/utils/`, `layouts/` y `features/{auth,dashboard}/{pages,ui}`; toda carpeta vacía tiene `.gitkeep`.
- [ ] No existen `src/app/core/models/` ni `src/app/core/tokens/`.
- [ ] `core/expense-report/` tiene sus cinco archivos (`.model.ts`, `.rules.ts`, `.rules.spec.ts`, `.repository.ts`, `mock-*.repository.ts`) y `EXPENSE_REPORT_REPOSITORY` **no** está registrado todavía en `app.config.ts`.
- [ ] `shared/ui/index.ts` es el único archivo `index.ts` bajo `src/app/` (verificable con `find src/app -name 'index.ts'`).
- [ ] Dado `pnpm start`, cuando se visita cada una de `/`, `/login`, `/forgot-password`, `/forgot-password/sent`, `/reset-password?token=abc`, `/reset-password/done`, `/dashboard` y `/ruta-inexistente`, entonces la URL resuelve según el mapa de la sección de contratos y la página muestra su `<h1>`.
- [ ] El título del documento cambia por ruta, tomando el `title` declarado en el archivo de rutas.
- [ ] `pnpm build` lista un chunk lazy para `auth` y otro para `dashboard`, y ninguna página ni layout aparece en el chunk inicial.
- [ ] `grep -rn "from '.*pages/" src/app/app.routes.ts` no devuelve nada: la raíz no importa páginas.
- [ ] Ningún archivo bajo `features/` o `layouts/` importa `mock-expense-report.repository`; ningún archivo bajo `shared/` importa de `core/` o `features/`.
- [ ] `src/app/app.html` contiene únicamente `<router-outlet />`; `src/app/app.css` ya no existe y `app.ts` no lo referencia.
- [ ] `pnpm test` pasa, y `app.spec.ts` ya no afirma nada sobre `'Hello, bambu-viaticos'`.
- [ ] `pnpm build` termina sin errores de TypeScript ni de Angular.
- [ ] `CLAUDE.md` tiene la sección de arquitectura con prefijo, dominio, áreas, regla del barrel y nombres de chunk esperados.
- [ ] `git diff` confirma que `src/styles.css`, `src/styles/theme.css`, `public/fonts/` y `references/viaticos-bambu-kit/` están intactos.
- [ ] Ninguna página ni layout contiene markup de diseño: ni clases de Tailwind, ni `styleUrl`, ni estructura más allá del `<h1>` / `<router-outlet />`.

## Risks

- **El enlace del correo de recuperación cambia de contrato.** El kit documenta `…/restablecer?token=`; este spec fija `/reset-password?token=`. Si backend ya tiene la plantilla, hay que avisar antes de que salga el primer correo real. Reversible, pero el costo crece una vez que existan tokens emitidos con la URL vieja.
- **El placeholder de `core/expense-report/` se queda mucho tiempo.** Un `ExpenseReport { id }` con una regla de ejemplo es ruido si el spec de dominio tarda; peor, alguien puede construir una pantalla encima del placeholder creyendo que es el modelo. Mitigación: el spec de dominio debe ir antes que el primer spec de pantalla del dashboard.
- **El `**` que redirige a `/login` oculta errores de ruteo** durante el desarrollo: un `loadChildren` mal escrito se ve igual que "no estoy logueado". Es el precio de no tener 404 propia todavía; cuando aparezca la página 404, deja de aplicar.
- **El orden de rutas del requisito 13 es frágil ante ediciones descuidadas.** Mover el `path: ''` de auth arriba del de `dashboard` rompe `/dashboard` en runtime sin romper el build. Lo cubre el criterio de aceptación que visita las siete URLs.
