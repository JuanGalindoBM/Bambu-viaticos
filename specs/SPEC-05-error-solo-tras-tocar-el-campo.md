# SPEC 05 — `bb-input` y `bb-checkbox`: el error solo aparece después de tocar el campo

> **Status:** Implemented — commit c816801 en `fix/shared-ui-touched-gate` (pendiente de PR)
> **Depends on:** SPEC 03 (primitivos `bb-*`)
> **Date:** 2026-10-09
> **Objective:** Cerrar el hueco de `bb-input` y `bb-checkbox` que pinta un campo requerido como erróneo desde el primer render, antes de que el usuario escriba nada.

## Context

SPEC 03 dejó `bb-input` implementando `FormValueControl<string>`: la directiva `[formField]` de `@angular/forms/signals` le cablea `invalid` directamente desde el estado del campo, y el componente calcula `isInvalid = invalid() || status() === 'error'`.

El efecto aparece en cuanto existe la primera pantalla real. Un `form({ email: '', password: '' })` con `required` nace inválido, así que `/login` renderizaría, antes de que el usuario toque nada, los dos campos con el borde `bb-warning` y con `aria-invalid="true"`. Visualmente contradice la maqueta —donde los campos arrancan neutros— y para un lector de pantalla es peor: anuncia «entrada no válida» en un campo que el usuario todavía no visitó.

El hueco no se puede resolver desde la página: `invalid` llega del `FieldTree` y `bb-input` no expone forma de posponerlo. Tiene que cerrarse en la capa que lo creó, y antes de que cinco pantallas con formulario lo hereden cada una a su manera.

## Goals

1. Un `bb-input` o `bb-checkbox` enlazado con `[formField]` a un campo inválido y **no tocado** se renderiza neutro: sin borde de error y sin `aria-invalid`.
2. El mismo campo, después de perder el foco (`blur`) o de que el formulario marque el campo como tocado, se renderiza con su borde de error y su `aria-invalid="true"`.
3. La página conserva una vía explícita para forzar el estado de error sin esperar al `blur` — la que necesita un error devuelto por el servidor.
4. El contrato público de los dos componentes crece solo con miembros que `@angular/forms/signals` ya define como opcionales: ninguna página tiene que cablear nada a mano.
5. `pnpm test` cubre los dos estados (antes y después de tocar) y termina sin errores.

## Non-goals

- **No** se cambia cuándo un campo es _válido_: la validación no se condiciona, solo su presentación. `form().invalid()` sigue siendo `true` desde el primer render, que es lo correcto para deshabilitar un botón de envío.
- **No** se toca ningún otro primitivo. `bb-field`, `bb-form-message`, `bb-button` y los 14 restantes quedan como están.
- **No** se decide cuándo cada página renderiza su `bb-form-message`: eso es `@if` de la página, y cada spec de pantalla lo declara.
- **No** se agrega un modo «validar al escribir» ni _debounce_: el único disparador es `touched`.
- **No** se maqueta ninguna pantalla ni se toca `features/`, `layouts/`, `app.routes.ts` ni `src/styles/`.
- **No** se agrega ninguna dependencia al `package.json`.

## Dependencies

- **SPEC 03 — Implemented (PR #3).** Se modifican dos de sus 18 archivos: `src/app/shared/ui/input/input.ts` y `src/app/shared/ui/checkbox/checkbox.ts`. El barrel `index.ts` no cambia: no hay exportaciones nuevas.
- **`@angular/forms` ^22.2.0.** La interfaz `FormUiControl<TValue>` ya declara `touched?: InputSignal<boolean>` como miembro **opcional** que la directiva de binding cablea sola cuando el control lo implementa (`node_modules/@angular/forms/types/signals.d.ts`, y el mapa `FIELD_STATE_KEY_TO_CONTROL_BINDING` en `fesm2022/signals.mjs`). Este spec solo lo implementa; no inventa contrato.

## Functional requirements

1. `BbInput` declara `readonly touched = input(false)`, parte opcional del contrato `FormValueControl`. No colisiona con el `output` existente `touch`, que sigue emitiéndose en `blur`.
2. `BbCheckbox` declara el mismo `readonly touched = input(false)`.
3. En `BbInput`, `isInvalid` pasa a ser `(invalid() && touched()) || status() === 'error'`. El `status` explícito sigue siendo inmediato: es la vía del requisito 5.
4. En `BbCheckbox`, el `aria-invalid` del `<input type="checkbox">` se emite con la misma condición `invalid() && touched()`.
5. Una página que necesite mostrar el error sin esperar al `blur` —un «correo o contraseña incorrectos» devuelto por el backend— pasa `[status]="'error'"`, que no depende de `touched`. Queda documentado en el JSDoc de `bb-input` como la vía soportada.
6. Un `bb-input` usado **sin** `[formField]` no cambia de comportamiento: `touched` vale `false`, `invalid` vale `false`, y el componente se pinta por `status`, exactamente como hoy.
7. El JSDoc de los dos componentes explica la regla en una línea: el error visual y el `aria-invalid` esperan a que el campo se marque como tocado; `status` no espera.
8. `src/app/shared/ui/input/signal-forms.spec.ts` suma dos casos: un campo requerido vacío recién renderizado **no** tiene `aria-invalid`, y el mismo campo lo gana tras el `blur`. El caso existente («un valor inválido marca el control con `aria-invalid` al perder el foco») debe seguir pasando sin modificarse.
9. El catálogo `/ui-kit` no se modifica. Sus ejemplos usan `status` explícito, no `[formField]` con campos inválidos sin tocar, así que ninguno cambia de aspecto.

## Interfaces & contracts

```ts
// bb-input — se suma al contrato FormValueControl<string>
touched: InputSignal<boolean>; // default false; lo cablea [formField]

// bb-checkbox — se suma al contrato FormCheckboxControl
touched: InputSignal<boolean>; // default false; lo cablea [formField]
```

Regla de presentación, idéntica en los dos:

```
borde de error y aria-invalid  ⟺  (invalid && touched) || status === 'error'
```

Nada más cambia: ni selectores, ni nombres de inputs existentes, ni el barrel, ni rutas, ni chunks de `pnpm build`.

## Edge cases

- **Campo inválido que el formulario marca como tocado sin `blur`** (por ejemplo, al intentar enviar). `markAsTouched()` propaga al estado del campo, la directiva lo refleja en el `input` y el borde aparece. Es justo el comportamiento que las pantallas de envío necesitan.
- **Campo tocado que vuelve a ser válido.** `invalid` pasa a `false` y el borde vuelve a neutro aunque `touched` siga en `true`. La condición es una conjunción, no un latch.
- **`status="error"` sobre un campo válido y no tocado.** Gana `status`: borde de error y `aria-invalid`. Es el caso del error del servidor y está soportado explícitamente.
- **`status="ok"` sobre un campo inválido y tocado.** Gana el error: `isInvalid` se evalúa antes que el borde verde, igual que hoy. Un campo no puede estar correcto y equivocado a la vez.
- **`bb-input` sin `[formField]` y sin `status`.** Neutro, como hoy. Ninguna de las pantallas lo usa así, pero el catálogo sí.
- **`bb-checkbox` requerido y no tocado** (el «Mantener la sesión iniciada» de Login no lo es, pero el patrón existe). Sin `aria-invalid` hasta el `blur`, igual que el input.
- **Entrada vacía, concurrencia, dependencias caídas, permisos.** N/A — ninguno de los dos componentes hace I/O ni mantiene estado fuera de sus signals.

## Acceptance criteria

- [ ] Dado un `<bb-input [formField]="f.email" />` sobre un campo `required` con valor vacío, cuando la página renderiza por primera vez, entonces el `<input>` **no** tiene atributo `aria-invalid` y su borde es `border-bb-border`.
- [ ] Dado ese mismo campo, cuando recibe foco y lo pierde sin escribir, entonces el `<input>` tiene `aria-invalid="true"` y borde `border-bb-warning`.
- [ ] Dado un campo tocado e inválido, cuando el usuario escribe un valor válido, entonces el `aria-invalid` desaparece.
- [ ] Dado un `<bb-input [status]="'error'" />` sin `[formField]`, cuando la página renderiza, entonces el borde de error y el `aria-invalid` aparecen de inmediato.
- [ ] Dado un `<bb-checkbox [formField]="f.terms" />` sobre un campo requerido sin marcar, cuando la página renderiza, entonces el `<input type="checkbox">` no tiene `aria-invalid`.
- [ ] `src/app/shared/ui/input/signal-forms.spec.ts` contiene los dos casos del requisito 8 y los tres casos originales siguen pasando sin editarse.
- [ ] `pnpm test` termina sin errores y `npx prettier --check` sobre los archivos tocados pasa.
- [ ] `/ui-kit` se ve exactamente igual que antes del cambio y AXE sigue reportando 0 violaciones.
- [ ] `git diff --name-only` contiene únicamente `src/app/shared/ui/input/input.ts`, `src/app/shared/ui/checkbox/checkbox.ts`, `src/app/shared/ui/input/signal-forms.spec.ts` y este spec.

## Risks

- **Este spec modifica dos archivos de SPEC 03, que está Implemented.** Es aditivo —un input opcional nuevo y una condición más restrictiva— y no rompe a ningún consumidor: hoy el único es `/ui-kit`, que no usa `[formField]` con campos inválidos. Se registra aquí porque SPEC 03 ya no se edita.
- **El binding automático de `touched` depende de que la directiva de Signal Forms siga mapeando ese miembro.** Está declarado como API pública 22.0 en `FormUiControl`, pero si una actualización menor de Angular lo cambiara, los campos volverían a pintarse de error desde el render inicial. La prueba del requisito 8 es exactamente la que lo detectaría, y por eso es parte del alcance y no un extra.
