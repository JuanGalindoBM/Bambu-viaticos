import { Component, InjectionToken, computed, contentChild, input } from '@angular/core';

/**
 * Token con el que `bb-form-message` se anuncia a su `bb-field`.
 *
 * Vive aquí, y no en `form-message.ts`, para que la dependencia sea de un solo sentido:
 * `form-message` importa `field`, nunca al revés. Un `contentChild` tipado contra la
 * clase del mensaje crearía un ciclo de imports entre los dos archivos.
 */
export const BB_FORM_MESSAGE = new InjectionToken<unknown>('BbFormMessage');

let nextFieldId = 0;

/**
 * Agrupa etiqueta, control y mensaje, y cablea la accesibilidad que de otro modo
 * cada página tendría que repetir (SPEC 03, req. 19 y 20): genera un id único por
 * instancia y lo publica por DI para que `bb-input` / `bb-checkbox` resuelvan su
 * `id`, el `for` de la etiqueta y el `aria-describedby`.
 *
 * `aria-describedby` solo apunta al mensaje cuando hay un `bb-form-message` proyectado:
 * un id colgando sin destino es peor que no tenerlo.
 */
@Component({
  selector: 'bb-field',
  host: { class: 'flex flex-col gap-2' },
  template: `
    <div class="flex flex-wrap items-baseline justify-between gap-3">
      <label [attr.for]="controlId" class="text-sm font-bold text-bb-text-2">{{ label() }}</label>
      <ng-content select="[bbFieldAction]" />
    </div>

    <ng-content />

    @if (hint(); as hintText) {
      <p [id]="hintId" class="m-0 text-bb-xs text-bb-text-subtle">{{ hintText }}</p>
    }

    <ng-content select="bb-form-message" />
  `,
})
export class BbField {
  readonly label = input.required<string>();
  readonly hint = input<string | undefined>(undefined);

  private readonly uid = `bb-field-${nextFieldId++}`;
  /** Id del control que este campo etiqueta. Lo lee `bb-input` / `bb-checkbox`. */
  readonly controlId = `${this.uid}-control`;
  readonly hintId = `${this.uid}-hint`;
  readonly messageId = `${this.uid}-message`;

  private readonly message = contentChild(BB_FORM_MESSAGE);

  /** Lista de ids para `aria-describedby`, o `null` si no hay nada que describir. */
  readonly describedBy = computed(() => {
    const ids: string[] = [];
    if (this.hint()) ids.push(this.hintId);
    if (this.message()) ids.push(this.messageId);
    return ids.length > 0 ? ids.join(' ') : null;
  });
}
