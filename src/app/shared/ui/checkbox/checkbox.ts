import { Component, computed, inject, input, model, output } from '@angular/core';
import type { FormCheckboxControl, ValidationError } from '@angular/forms/signals';

import { BbField } from '../field/field';

let nextCheckboxId = 0;

/**
 * Casilla del design system. La etiqueta llega por proyección de contenido y el
 * `<label>` envuelve al `<input>`, de modo que todo el bloque —que mide al menos
 * 44 px de alto— es área de click.
 *
 * Implementa `FormCheckboxControl` de `@angular/forms/signals`. El contrato prohíbe
 * declarar un miembro `value`: eso es territorio de `bb-input`.
 *
 * El `aria-invalid` espera a que el campo se marque como tocado (`touched`, que
 * `[formField]` cablea solo): una casilla requerida sin marcar no nace inválida
 * antes de que el usuario la visite (SPEC 05).
 */
@Component({
  selector: 'bb-checkbox',
  host: { class: 'block' },
  template: `
    <label
      class="flex min-h-bb-touch cursor-pointer items-center gap-2.5 text-sm text-bb-text-2"
      [attr.for]="resolvedId()"
    >
      <input
        type="checkbox"
        class="m-0 size-[18px] shrink-0 accent-bb-green"
        [id]="resolvedId()"
        [checked]="checked()"
        [disabled]="disabled()"
        [attr.name]="name() || null"
        [attr.required]="required() ? '' : null"
        [attr.aria-invalid]="invalid() && touched() ? 'true' : null"
        [attr.aria-describedby]="describedBy()"
        (change)="onChange($event)"
        (blur)="touch.emit()"
      />
      <ng-content />
    </label>
  `,
})
export class BbCheckbox implements FormCheckboxControl {
  // --- Contrato de FormCheckboxControl -------------------------------------
  readonly checked = model(false);
  readonly invalid = input(false);
  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
  readonly disabled = input(false);
  readonly required = input(false);
  readonly name = input('');
  readonly touched = input(false);
  readonly touch = output<void>();

  /** Id propio, usado solo cuando la casilla vive fuera de un `bb-field`. */
  readonly id = input(`bb-checkbox-${nextCheckboxId++}`);

  private readonly field = inject(BbField, { optional: true });

  protected readonly resolvedId = computed(() => this.field?.controlId ?? this.id());
  protected readonly describedBy = computed(() => this.field?.describedBy() ?? null);

  protected onChange(event: Event): void {
    this.checked.set((event.target as HTMLInputElement).checked);
  }
}
