import {
  Component,
  Directive,
  computed,
  contentChild,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import type { FormValueControl, ValidationError } from '@angular/forms/signals';

import { BbField } from '../field/field';
import { BbIcon } from '../icon/icon';
import type { BbIconName } from '../icon/icon-registry';

export type BbInputStatus = 'default' | 'error' | 'ok';

/** Marca el contenido que `bb-input` proyecta al final del control (el ojo de contraseña). */
@Directive({ selector: '[bbInputAction]' })
export class BbInputAction {}

let nextInputId = 0;

const BASE =
  'w-full min-h-bb-control py-0 bg-bb-surface border rounded-md text-bb-text text-base ' +
  'font-[inherit] placeholder:text-bb-placeholder focus:outline-none focus:border-bb-green ' +
  'focus:ring-3 focus:ring-bb-focus-ring disabled:text-bb-placeholder disabled:cursor-not-allowed';

/**
 * Campo de texto del design system.
 *
 * Implementa `FormValueControl<string>` de `@angular/forms/signals`, así que se enlaza
 * a un `FieldTree` con la directiva de binding de Signal Forms sin escribir un solo
 * `ControlValueAccessor`. El contrato prohíbe declarar un miembro `checked` — eso es
 * territorio de `bb-checkbox`.
 *
 * `[formField]` y `[(value)]` son mutuamente excluyentes: los dos escriben el mismo
 * `model`, y usados a la vez el resultado depende del orden de evaluación.
 *
 * El `<input>` se renderiza siempre a 16 px para que iOS no haga zoom al enfocar.
 *
 * El borde de error y el `aria-invalid` esperan a que el campo se marque como
 * tocado (`touched`, que `[formField]` cablea solo): un campo requerido vacío no
 * nace pintado de error antes de que el usuario lo visite. `status="error"` es la
 * vía para mostrar el error de inmediato sin esperar al `blur` — p. ej. un «correo
 * o contraseña incorrectos» que devuelve el backend (SPEC 05).
 */
@Component({
  selector: 'bb-input',
  imports: [BbIcon],
  host: { class: 'block' },
  template: `
    <div class="relative flex items-center">
      @if (icon(); as iconName) {
        <span class="pointer-events-none absolute left-4 flex text-bb-placeholder">
          <bb-icon [name]="iconName" />
        </span>
      }

      <input
        [id]="resolvedId()"
        [class]="inputClass()"
        [type]="type()"
        [value]="value()"
        [disabled]="disabled()"
        [attr.name]="name() || null"
        [attr.placeholder]="placeholder() || null"
        [attr.autocomplete]="autocomplete() || null"
        [attr.required]="required() ? '' : null"
        [attr.aria-invalid]="isInvalid() ? 'true' : null"
        [attr.aria-describedby]="describedBy()"
        (input)="onInput($event)"
        (blur)="touch.emit()"
      />

      <span class="absolute right-1 flex items-center">
        <ng-content select="[bbInputAction]" />
      </span>
    </div>
  `,
})
export class BbInput implements FormValueControl<string> {
  // --- Contrato de FormValueControl ---------------------------------------
  readonly value = model('');
  readonly invalid = input(false);
  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
  readonly disabled = input(false);
  readonly required = input(false);
  readonly name = input('');
  readonly touched = input(false);
  readonly touch = output<void>();

  // --- API propia ----------------------------------------------------------
  readonly type = input('text');
  readonly placeholder = input('');
  readonly autocomplete = input('');
  readonly icon = input<BbIconName | undefined>(undefined);
  readonly status = input<BbInputStatus>('default');
  /** Id propio, usado solo cuando el input vive fuera de un `bb-field`. */
  readonly id = input(`bb-input-${nextInputId++}`);

  private readonly field = inject(BbField, { optional: true });
  private readonly action = contentChild(BbInputAction);

  protected readonly resolvedId = computed(() => this.field?.controlId ?? this.id());
  protected readonly describedBy = computed(() => this.field?.describedBy() ?? null);
  protected readonly isInvalid = computed(
    () => (this.invalid() && this.touched()) || this.status() === 'error',
  );

  private readonly borderClass = computed(() => {
    if (this.isInvalid()) return 'border-bb-warning';
    return this.status() === 'ok' ? 'border-bb-green' : 'border-bb-border';
  });

  protected readonly inputClass = computed(() => {
    const left = this.icon() ? 'pl-12' : 'pl-4';
    const right = this.action() ? 'pr-14' : 'pr-4';
    return `${BASE} ${this.borderClass()} ${left} ${right}`;
  });

  protected onInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
  }
}
