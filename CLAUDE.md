# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## Commands

This project uses **pnpm** (pinned to `12.6.0` via `packageManager` in `package.json`) — do not use `npm`/`yarn`.

- `pnpm install` — install dependencies
- `pnpm start` (`ng serve`) — dev server at `http://localhost:4200`, rebuilds on file changes
- `pnpm build` (`ng build`) — production build to `dist/`
- `pnpm watch` — development-mode build with `--watch`
- `pnpm test` (`ng test`) — runs the unit tests via the Vitest-based `@angular/build:unit-test` builder
  - To run a single file or filter, forward args after `--`, e.g. `ng test -- src/app/app.spec.ts`

There is no lint script or ESLint config in this repo; formatting is enforced via Prettier (`.prettierrc`, `printWidth: 100`, single quotes, Angular parser for `*.html`).

## Architecture

This is a standalone Angular 22 application (`bambu-viaticos`) for Bambu's expense-report ("viáticos") platform.

- `src/main.ts` bootstraps `App` (`src/app/app.ts`) with `appConfig`. `App` is a bare shell: its template is only `<router-outlet />`.
- `src/app/app.config.ts` registers global providers: `provideBrowserGlobalErrorListeners()` and `provideRouter(routes, withComponentInputBinding())`.
- Styling uses **Tailwind CSS v4** via `@tailwindcss/postcss` (configured in `.postcssrc.json`), with global styles in `src/styles.css` and the Bambu theme in `src/styles/theme.css` (SPEC 01).

### Layered file architecture

The file layout follows the **`angular-file-architecture`** skill — read it for the generic rules (the four membership rules, dependency direction, the domain-module pattern). What follows is only what is specific to *this* project:

```
src/app/
  core/            auth/guards · auth/services · interceptors · expense-report/
  shared/          ui/ (+ index.ts) · directives · pipes · utils
  layouts/         auth-layout · dashboard-layout
  features/        auth/ · dashboard/ · ui-kit/   (each with <area>.routes.ts, pages/, ui/)
```

- **Domain:** `expense-report`. All business types, pure rules and the repository contract live in `core/expense-report/`; `mock-expense-report.repository.ts` is the only file that will ever know about a real backend. Screens inject `EXPENSE_REPORT_REPOSITORY`, never the mock class. *Its contents are still the scaffold placeholder — modelling the real `ExpenseReport` is a pending spec.*
- **Two selector prefixes:** `bb-` for design-system primitives in `shared/ui/` (matching the `--bb-*` design tokens), `app-` for layouts and feature pages.
- **One barrel in the whole project:** `shared/ui/index.ts`. Adding one under `core/` or `features/` couples the import graph and drags lazy modules into the initial chunk.
- **File names** are kebab-case with no type suffix on components and pages (`login.ts`, not `login.component.ts`). Suffixes are reserved for `.guard.ts`, `.interceptor.ts`, `.service.ts`, `.repository.ts`, `.rules.ts`, `.model.ts`, `.routes.ts`.
- **Routing:** `app.routes.ts` loads one area per `loadChildren`, each page per `loadComponent`. Route order is a contract: `dashboard` must stay declared *before* the root `path: ''` of auth, and two-segment paths (`forgot-password/sent`, `reset-password/done`) before their one-segment prefix. Route `title`s are declared in the route files, never in components.
- **Expected lazy chunks** in `pnpm build` — if one disappears, someone imported it statically: `auth-routes`, `dashboard-routes`, `ui-kit-routes`, `auth-layout`, `dashboard-layout`, `login`, `forgot-password`, `forgot-password-sent`, `reset-password`, `reset-password-done`, `home`, `catalog`.

- **`shared/ui/` is populated** (SPEC 03): 18 primitives with the `bb-` prefix, all exported from `index.ts`. They are agnostic of the domain — a `bb-*` that takes an input with business vocabulary (`reportStatus`, `expenseTotal`) belongs in `features/<area>/ui/`, not here. `bb-icon` owns the only icon registry and is the only file in the layer allowed to write an `<svg>`; `bb-input`/`bb-checkbox` implement the `FormValueControl` / `FormCheckboxControl` contracts of `@angular/forms/signals`, so they bind with `[formField]` and never need a `ControlValueAccessor`.
- **`features/ui-kit/`** is a development catalog at `/ui-kit` that renders every primitive in every declared state — the surface for comparing against `references/viaticos-bambu-kit/screens/` and for running AXE. It is **not** a product screen and uses neither layout.

Pages and layouts are currently **stubs** (a single `<h1>` / `<router-outlet />`): the visual design of each screen is a separate spec.

## Design Reference (`references/viaticos-bambu-kit/`)

This directory holds the UI design reference exported from Claude Design for the **auth module** (Login, Olvidé mi contraseña, Restablecer contraseña) and the **post-login Dashboard**. It is read-only source material to implement against, not app code — translate it into standalone Angular components under `src/app/`, pulling values from the design tokens instead of hardcoding them.

- `screens/*.html` — static HTML/CSS/JS mockups, browsable directly and linked end-to-end (login → dashboard → logout). `app.css` is the app shell (sidebar, topbar, cards, mobile bottom bar); `auth.css`/`auth.js` are the auth-flow components and reference behavior (show-password toggle, password policy meter, resend cooldown).
- `referencia-diseno/*.dc.html` — the original per-screen files exported from the Claude Design canvas, including `Movil*` mobile variants (390×844).
- `tokens/tokens.css` + `tokens/tokens.json` — canonical design tokens (`--bb-*`): colors (pure black `#000000` surface, neon green `#00FF00` accent), the Sansation typeface, spacing, radii, and control sizing. `tokens.json` mirrors the same values for non-CSS targets (Tailwind, MUI, Flutter).
- `assets/` — Bambu logo, auth background image, and the Sansation font files (OFL-licensed).
- The kit's own `README.md` documents the full auth flow and its expected backend contract (`POST /auth/login`, `/auth/forgot-password`, `/auth/reset-password`) plus suggested security rules (Argon2id hashing, generic responses to prevent account enumeration, rate limiting, session invalidation on reset) — read it before implementing the auth module, since `auth.js`'s client-side validation assumes the backend enforces the same rules.
- Responsive breakpoint is 768px: desktop uses a two-column auth layout / fixed 248px dashboard sidebar; mobile collapses to a centered logo header and, on the dashboard, a fixed bottom nav bar.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly. `OnPush` is the default in Angular v22+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `model()` for two-way bound properties with `[(prop)]` syntax instead of pairing `input()` with `output()`
- Use `computed()` for derived state
- Use `linkedSignal()` for state derived from multiple reactive sources that must stay synchronized
- Prefer inline templates for small components
- Prefer Signal Forms (`@angular/forms/signals`) for new forms. They are stable in Angular v22+ and provide signal-based state, type-safe field access, and schema-based validation
- When not using Signal Forms, prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- Do NOT import `CommonModule`, import only the directives and pipes the template uses, such as `AsyncPipe` or `DatePipe`
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)
- Use the `inject()` function instead of constructor injection
