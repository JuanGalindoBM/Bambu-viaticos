import { Component, computed, inject, input } from '@angular/core';

import { BB_FORM_MESSAGE, BbField } from '../field/field';

export type BbFormMessageTone = 'error' | 'ok';

/**
 * Mensaje de validación de un campo. Dentro de un `bb-field` toma el id al que
 * apunta el `aria-describedby` del control; fuera de él se renderiza igual, pero
 * asociarlo es responsabilidad de quien lo use así.
 *
 * El tono `error` lleva `role="alert"`: el error nunca se comunica solo por color
 * (SPEC 03, req. 22 — WCAG 1.4.1).
 */
@Component({
  selector: 'bb-form-message',
  providers: [{ provide: BB_FORM_MESSAGE, useExisting: BbFormMessage }],
  host: {
    '[id]': 'field?.messageId ?? null',
    '[attr.role]': 'tone() === "error" ? "alert" : null',
    '[class]': 'hostClass()',
  },
  template: `<ng-content />`,
})
export class BbFormMessage {
  readonly tone = input<BbFormMessageTone>('error');

  protected readonly field = inject(BbField, { optional: true });

  protected readonly hostClass = computed(
    () => `block m-0 text-bb-xs ${this.tone() === 'error' ? 'text-bb-warning' : 'text-bb-green'}`,
  );
}
