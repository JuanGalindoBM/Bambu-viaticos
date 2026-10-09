import { Component, input } from '@angular/core';

/**
 * Tarjeta con encabezado opcional.
 *
 * El encabezado —y con él el slot `[bbCardAction]`— solo se renderiza cuando
 * `heading` tiene valor: una acción sin encabezado no tiene dónde ir.
 */
@Component({
  selector: 'bb-card',
  host: {
    class: 'flex flex-col bg-bb-surface border border-bb-border-subtle rounded-lg',
  },
  template: `
    @if (heading(); as headingText) {
      <div
        class="flex items-center justify-between gap-3 border-b border-bb-surface-2 px-4 py-3.5 md:px-6 md:py-[18px]"
      >
        <h2 class="m-0 text-lg font-bold">{{ headingText }}</h2>
        <ng-content select="[bbCardAction]" />
      </div>
    }
    <ng-content />
  `,
})
export class BbCard {
  readonly heading = input<string | undefined>(undefined);
}
