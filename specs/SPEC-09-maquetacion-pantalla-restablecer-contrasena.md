# SPEC 09 — Maquetación de la pantalla «Restablecer contraseña»

> **Status:** Draft
> **Depends on:** SPEC 03 (primitivos `bb-*`), SPEC 04 (layouts), SPEC 05 (error solo tras tocar)
> **Date:** 2026-10-09
> **Objective:** Maquetar `/reset-password` con su medidor de fortaleza, su lista de política y su confirmación, componiendo primitivos `bb-*` dentro del shell de auth.

## Context

`src/app/features/auth/pages/reset-password/reset-password.ts` sigue siendo el `<h1>` de SPEC 02. Es la pantalla con más estado de las seis: `auth.js` le dedica dos tercios de su código —cuatro barras de fortaleza, cinco reglas de política, coincidencia de contraseñas y un botón que solo se habilita cuando todo cuadra—.

SPEC 03 dejó fuera el medidor y la lista de reglas a propósito: son piezas con vocabulario de auth, no primitivos del design system, y su sitio es `features/auth/ui/`. Esta es la única pantalla de la tanda que crea archivos ahí, así que sigue sin compartir nada con las otras cinco; y es también la única que necesita lógica pura con pruebas propias, porque evaluar una política de contraseñas a ojo no es verificable.

## Goals

1. `/reset-password` reproduce `screens/03-restablecer-contrasena.html` en escritorio y `referencia-diseno/MovilRestablecer.dc.html` en móvil, sin hex ni `<svg>` escritos a mano.
2. El medidor de fortaleza refleja en vivo cuántas de las cuatro reglas comprobables cumple la contraseña, con su etiqueta de texto además del color.
3. La lista de política marca cada regla como cumplida o pendiente, y lo comunica con texto, no solo con el icono.
4. La confirmación avisa en vivo si las dos contraseñas coinciden o no, y el botón de guardar solo se habilita cuando la política se cumple y las dos coinciden.
5. La evaluación de la política vive en funciones puras, fuera de Angular, con pruebas unitarias propias.
6. `/reset-password` pasa AXE sin violaciones.

## Non-goals

- **No** se guarda ninguna contraseña. No hay `HttpClient`, ni llamada a `POST /auth/reset-password`, ni navegación a «Contraseña actualizada» al enviar.
- **No** se maneja el token del enlace. El kit lleva un `<input type="hidden" name="token">` que se llena del _query param_; aquí no se renderiza: sin envío no hay nada que transportar, y leerlo sería lógica de autenticación.
- **No** se valida la regla de historial en cliente. Ver el requisito 12: es la única de las cinco que solo el backend puede comprobar.
- **No** se implementa fortaleza «real» (entropía, diccionarios, `zxcvbn`). El medidor cuenta reglas cumplidas, igual que `auth.js`, y no se agrega ninguna dependencia.
- **No** se maqueta el panel de marca ni el contenedor: son de `auth-layout` (SPEC 04).
- **No** se toca `shared/ui/`, `auth.routes.ts` ni ningún archivo fuera de `features/auth/pages/reset-password/` y `features/auth/ui/password-strength/`.
- **No** se reutiliza el medidor en ninguna otra pantalla hoy. Vive en `features/auth/ui/` porque ahí es donde le toca por vocabulario, no porque haya un segundo consumidor.

## Dependencies

- **SPEC 04.** El `<main>` centrado de 420 px y el contrato de landmarks: esta página no emite `<main>`, `<header>`, `<nav>` ni `<aside>`, y sí emite el único `<h1>`.
- **SPEC 05.** Los dos campos de contraseña son obligatorios: sin el gate de `touched` nacerían en rojo.
- **SPEC 03.** `bb-chip` (`icon`), `bb-field`, `bb-input` (`type`, `status`, slot `[bbInputAction]`), `bb-form-message` (`tone`), `button[bb-button]` (`disabled`), `button[bb-icon-button]` y `bb-icon`. Iconos del registro: `user`, `eye`, `eye-off`, `check`, `circle`.
- **SPEC 01.** Los colores del medidor son tokens que ya existen: `bb-warning` (#FFB27A), `bb-caution` (#FFD666), `bb-green-soft` (#9CFF9C) y `bb-green` (#00FF00), y la barra apagada es `bb-border-subtle`. El único color del kit sin token es el `#6E6E6E` del icono de regla pendiente; se sustituye por `bb-placeholder`, que además contrasta mejor (ver requisito 11).
- **`@angular/forms/signals`.** `form`, `required`, `[formField]`, `[formRoot]`.
- **`references/viaticos-bambu-kit/screens/03-restablecer-contrasena.html`, `auth.css` (bloque «Fortaleza y requisitos») y `auth.js`** (los objetos `LEVELS` y `RULES`), más **`referencia-diseno/MovilRestablecer.dc.html`** (solo lectura).

## Functional requirements

### Lógica pura — `features/auth/ui/password-strength/password-strength.rules.ts`

1. Exporta el tipo `PasswordRuleKey = 'len' | 'case' | 'num' | 'special' | 'history'` y una constante con el texto de cada regla, en el orden del kit: «Al menos 12 caracteres», «Una mayúscula y una minúscula», «Al menos un número», «Al menos un carácter especial», «Distinta a tus últimas 5 contraseñas».
2. Exporta `evaluatePassword(password: string): PasswordEvaluation`, función pura sin dependencias de Angular, que devuelve qué reglas comprobables cumple y la puntuación resultante.
3. Las cuatro comprobaciones son las de `auth.js`, con sus acentos incluidos: longitud ≥ 12; `/[A-ZÁÉÍÓÚÑ]/` **y** `/[a-záéíóúñ]/`; `/\d/`; `/[^A-Za-z0-9ÁÉÍÓÚÑáéíóúñ]/`.
4. La puntuación es el número de esas cuatro reglas cumplidas (0 a 4). La regla de historial **no** suma.
5. Exporta la escala de niveles con su etiqueta y su clase de color de token: 1 → «Débil» / `bb-warning`, 2 → «Regular» / `bb-caution`, 3 → «Buena» / `bb-green-soft`, 4 → «Fuerte» / `bb-green`. Con la contraseña vacía no hay nivel y la etiqueta queda vacía.
6. `password-strength.rules.spec.ts` cubre, como mínimo: cadena vacía (0 de 4, sin nivel), cada regla aislada, una contraseña que cumple las cuatro, el caso de acentos (`Contraseñaseguraña1!` cumple `case`), y una contraseña de exactamente 12 caracteres (el límite, que cumple).

### Componentes de `features/auth/ui/password-strength/`

7. `password-strength-meter.ts` (selector `app-password-strength-meter`) recibe la evaluación y renderiza la fila del kit: cuatro barras de 4 px de alto en rejilla con `gap-1.5`, y a la derecha la etiqueta a `text-bb-xs font-bold` con ancho mínimo de 72 px, alineada a la derecha.
8. Las barras encendidas toman el color del nivel actual; las apagadas, `bg-bb-border-subtle`. Con la contraseña vacía, las cuatro están apagadas y la etiqueta vacía.
9. La etiqueta lleva `aria-live="polite"`: el cambio de nivel se anuncia con palabras («Débil», «Fuerte»), no solo con color — WCAG 1.4.1.
10. `password-policy-list.ts` (selector `app-password-policy-list`) renderiza la lista del kit: `<ul role="list" aria-label="Requisitos de la contraseña">` con `bg-bb-surface`, borde `bb-border-subtle`, `rounded-md`, `p-4` y `gap-2.5`, y cada ítem en fila con `gap-2.5` a `text-sm`.
11. Cada ítem cumplido muestra `<bb-icon name="check" [size]="18" />` en `text-bb-green` y su texto en `text-bb-text`; cada ítem pendiente muestra `<bb-icon name="circle" [size]="18" />` en `text-bb-placeholder` y su texto en `text-bb-text-subtle`. (El kit usa `#6E6E6E` para el icono pendiente; se usa el token `bb-placeholder`, que es el valor más cercano del tema y contrasta mejor sobre `bb-surface`.)
12. El estado de cada ítem se comunica además con texto para quien no ve el icono: cada `<li>` antepone «Cumplido:» o «Pendiente:» en un elemento visualmente oculto. **La regla de historial es la excepción**: nunca se marca como cumplida y su prefijo oculto es «Lo verifica el servidor:». El kit la da por buena en cuanto se escribe una letra, que es informarle al usuario algo que el cliente no sabe.
13. Ninguno de los dos componentes mantiene estado: reciben la evaluación como `input()` y la renderizan.

### Pantalla — `features/auth/pages/reset-password/`

14. El contenido es una columna con tres bloques: encabezado, formulario y nota de cierre.
15. El encabezado es una columna con `gap-3`: `<h1>Crea una nueva contraseña</h1>` a `text-bb-h2 font-bold leading-[1.15]` (28 px por debajo de `md:`) y, debajo, `<bb-chip icon="user">` con el correo del usuario.
16. El correo del chip sale de un `signal` privado con valor `'nombre@bambu-techservices.com'` y un `TODO` de una línea que marca el punto de inyección del dato real.
17. El modelo es `signal({ password: '', confirm: '' })` y el formulario es `form(modelo, (path) => { required(path.password); required(path.confirm); })`. El `<form>` lleva `[formRoot]` y `gap-5` (20 px), que es el `.stack` de esta pantalla.
18. La política y la coincidencia **no** se declaran como validadores de esquema, sino como `computed()` sobre el modelo: su resultado alimenta al medidor, a la lista, a los mensajes y al botón, y duplicarlo en dos sitios garantiza que un día discrepen.
19. Campo «Nueva contraseña»: `bb-field` con `<bb-input [formField]="form.password" [type]="visible() ? 'text' : 'password'" autocomplete="new-password" placeholder="Mínimo 12 caracteres" />`, y el `app-password-strength-meter` inmediatamente debajo, dentro del mismo campo.
20. Dentro de ese `bb-input` se proyecta, con `bbInputAction`, un `<button bb-icon-button type="button">` que alterna un `signal` `visible`. **Alterna los dos campos a la vez** (nueva y confirmación), como el `data-toggle-password="newpwd confirmpwd"` del kit, y su `aria-label` va en plural: «Mostrar contraseñas» / «Ocultar contraseñas».
21. El `app-password-policy-list` va fuera del campo, entre los dos campos, como en el kit.
22. Campo «Confirma tu contraseña»: `<bb-input [formField]="form.confirm" [type]="visible() ? 'text' : 'password'" autocomplete="new-password" placeholder="Escríbela de nuevo" [status]="confirmStatus()" />`, sin icono y sin acción.
23. `confirmStatus()` vale `'default'` mientras la confirmación está vacía, `'ok'` si coincide con la contraseña y `'error'` si no. Usa la vía `status` de SPEC 05 a propósito: aquí el aviso debe aparecer mientras se escribe, sin esperar al `blur`.
24. Bajo la confirmación se renderiza un `bb-form-message` con `tone="error"` y el texto «Las contraseñas no coinciden.» cuando no coinciden, o con `tone="ok"` y «Las contraseñas coinciden.» cuando sí. Con la confirmación vacía no se renderiza ninguno.
25. El botón de envío es `<button bb-button type="submit" [disabled]="!canSave()">Guardar contraseña</button>`, sin icono, en variante y tamaño por defecto.
26. `canSave()` es verdadero cuando las **cuatro** reglas comprobables se cumplen y las dos contraseñas coinciden. La regla de historial no entra: el cliente no puede evaluarla.
27. El manejador de envío no hace nada más que dejar un `TODO` de una línea donde irá la llamada al backend. El `[formRoot]` ya previene el envío nativo.
28. La nota de cierre es un `<p>` a `text-bb-xs leading-normal text-bb-text-subtle` con «Al guardar, cerraremos tu sesión en todos los dispositivos por seguridad.».
29. La plantilla de la página vive en `reset-password.html`, junto al `.ts`, con ruta relativa: es la más larga de las seis.
30. El componente conserva su selector `app-reset-password`, su clase `ResetPassword` y su archivo `reset-password.ts`.

## Interfaces & contracts

Archivos nuevos bajo `src/app/features/auth/ui/password-strength/`, **sin barrel** (el único del proyecto sigue siendo `shared/ui/index.ts`):

```ts
// password-strength.rules.ts — puro, sin Angular
export type PasswordRuleKey = 'len' | 'case' | 'num' | 'special' | 'history';

export interface PasswordEvaluation {
  readonly rules: Readonly<Record<PasswordRuleKey, boolean>>; // 'history' siempre false
  readonly score: 0 | 1 | 2 | 3 | 4; // reglas comprobables cumplidas
  readonly label: string; // '' | 'Débil' | 'Regular' | 'Buena' | 'Fuerte'
  readonly colorClass: string; // clase de token del nivel
}

export declare const PASSWORD_RULE_TEXTS: Readonly<Record<PasswordRuleKey, string>>;
export declare function evaluatePassword(password: string): PasswordEvaluation;

// password-strength-meter.ts — <app-password-strength-meter [evaluation]="…" />
evaluation: InputSignal<PasswordEvaluation>; // obligatorio

// password-policy-list.ts — <app-password-policy-list [evaluation]="…" />
evaluation: InputSignal<PasswordEvaluation>; // obligatorio
```

Los dos componentes son de uso interno del área `auth`: ninguna página de otra área los importa, y por vivir en `features/auth/ui/` entran en el chunk `auth-routes`, no en el inicial. No se introducen rutas, assets, tokens ni chunks nuevos.

## Edge cases

- **Primer render con los dos campos vacíos.** Campos neutros (SPEC 05), cuatro barras apagadas, etiqueta vacía, las cinco reglas en pendiente, ningún mensaje de coincidencia, y el botón deshabilitado.
- **Contraseña de exactamente 12 caracteres.** Cumple `len`: la comparación es `>= 12`, y la prueba del requisito 6 lo fija para que nadie lo cambie a `>` por descuido.
- **Contraseña que cumple las cuatro reglas pero confirmación vacía.** Medidor en «Fuerte», lista con cuatro checks, sin mensaje de coincidencia, botón **deshabilitado**.
- **Confirmación que coincide y luego deja de coincidir al seguir escribiendo.** El mensaje cambia de «coinciden» a «no coinciden», el borde pasa de verde a naranja, y el botón se deshabilita en el mismo instante. El mensaje de error lleva `role="alert"` (lo pone `bb-form-message`), así que se anuncia al aparecer.
- **Escribir primero la confirmación y después la contraseña.** Funciona igual: la comparación es simétrica y se recalcula con cualquiera de los dos.
- **Alternar la visibilidad.** Cambia el `type` de los **dos** campos a la vez; valores, caret y foco se conservan. El `aria-label` del botón va en plural, porque afecta a dos campos.
- **Contraseña solo de espacios.** Los espacios cuentan como carácter especial y como longitud; `case` y `num` fallan, así que la puntuación llega a 2 como mucho y el botón no se habilita. No se hace `trim()`: recortar silenciosamente la contraseña del usuario la cambiaría sin avisar.
- **Contraseña muy larga (200+ caracteres).** No hay límite superior y el medidor se queda en «Fuerte». No se trunca.
- **Pegar la contraseña desde un gestor.** Llega por evento `input` y todo se recalcula; no se bloquea el pegado — bloquearlo empuja a elegir contraseñas peores.
- **La regla de historial nunca se marca.** Es deliberado (requisito 12) y no impide guardar (requisito 26). Visto contra la maqueta, es la única diferencia funcional con `auth.js`.
- **Botón deshabilitado y lectores de pantalla.** Un botón muerto no explica qué falta; aquí se acepta porque la lista de política y el mensaje de coincidencia dicen exactamente qué falta y ambos están en el flujo de lectura antes del botón.
- **Texto al 200 % y ancho de 320 px.** Las cuatro barras son una rejilla fraccionaria y se encogen; la etiqueta tiene ancho mínimo de 72 px y puede hacer wrap bajo las barras sin romper la fila. Los ítems de la lista hacen wrap en dos líneas con el icono alineado al inicio.
- **Concurrencia, dependencias caídas, timeouts, permisos.** N/A — la pantalla no hace I/O.

## Acceptance criteria

- [ ] Dado `/reset-password` a 1280 px, se ve, en orden: «Crea una nueva contraseña», el chip con el icono de usuario y el correo, el campo de nueva contraseña con el ojo, el medidor de cuatro barras, la caja con las cinco reglas, el campo de confirmación, y el botón «Guardar contraseña» deshabilitado.
- [ ] Dado `/reset-password` a 390 px, el mismo contenido se alinea arriba bajo el logo del header móvil, el título baja a 28 px y no hay scroll horizontal.
- [ ] `document.querySelectorAll('h1')` devuelve exactamente un elemento, y es «Crea una nueva contraseña».
- [ ] La página no contiene ningún `<main>`, `<header>`, `<nav>` ni `<aside>` propio, y no renderiza ningún `<input type="hidden">`.
- [ ] Dado el campo de contraseña recién cargado, no tiene `aria-invalid` ni borde naranja.
- [ ] Dado «abc» escrito en la contraseña, el medidor enciende 0 barras con etiqueta vacía o nivel mínimo según la puntuación, y las reglas `len`, `case`, `num` y `special` siguen pendientes salvo las que «abc» cumpla.
- [ ] Dado «Viaticos2026!» escrito en la contraseña, las cuatro reglas comprobables se marcan cumplidas, el medidor enciende las cuatro barras en verde y la etiqueta dice «Fuerte».
- [ ] Dada esa contraseña y una confirmación distinta, aparece «Las contraseñas no coinciden.» con `role="alert"`, el campo de confirmación queda con borde naranja y el botón sigue deshabilitado.
- [ ] Dada esa contraseña y la confirmación idéntica, aparece «Las contraseñas coinciden.», el campo queda con borde verde y el botón **se habilita**.
- [ ] Dado el botón del ojo, cuando se activa, los **dos** campos pasan a texto legible a la vez y el `aria-label` cambia a «Ocultar contraseñas».
- [ ] La regla «Distinta a tus últimas 5 contraseñas» permanece sin marcar en todos los casos anteriores y no impide habilitar el botón.
- [ ] `password-strength.rules.spec.ts` cubre los cinco casos del requisito 6 y `pnpm test` termina sin errores.
- [ ] AXE sobre `/reset-password` reporta 0 violaciones, con la lista de política anunciada como lista y cada ítem con su estado en texto.
- [ ] Comparada contra `screens/03-restablecer-contrasena.html` lado a lado, no hay diferencias de espaciado, tamaño de fuente ni color en ninguno de los dos breakpoints, salvo la regla de historial del requisito 12.
- [ ] `pnpm build` sigue listando el chunk `reset-password` y no aparece ninguno nuevo; `npx prettier --check` sobre los archivos tocados pasa.
- [ ] `git diff --name-only` solo toca `src/app/features/auth/pages/reset-password/**`, `src/app/features/auth/ui/password-strength/**` y este spec.

## Risks

- **La regla de historial se desvía del kit a propósito.** Si al revisar contra la maqueta se decide que debe marcarse como el kit la marca, es un cambio de una línea en `password-policy-list.ts` — pero conviene decidirlo **antes** de aprobar este spec, no después de implementarlo, porque cambia lo que la pantalla le promete al usuario.
- **`features/auth/ui/` nace con esta pantalla.** Es la carpeta donde acabarán las piezas compartidas del área, y la primera que llega fija su estilo. Si el spec de autenticación necesita después un medidor con otra API, hereda esta; mitigación: la API es un solo `input` con un objeto de datos puro, que es lo más difícil de equivocar.
