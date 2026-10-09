import { Component, computed, input } from '@angular/core';

/**
 * Tarjeta de resumen del dashboard.
 *
 * El valor hace wrap en vez de truncarse: un monto recortado con elipsis es peor
 * que una tarjeta más alta.
 */
@Component({
  selector: 'bb-stat-card',
  host: { '[class]': 'hostClass()' },
  template: `
    <span [class]="labelClass()">{{ label() }}</span>
    <span [class]="valueClass()"
      >{{ value() }}
      @if (unit(); as unitText) {
        <span class="text-sm font-normal text-bb-text-subtle"> {{ unitText }}</span>
      }
    </span>
  `,
})
export class BbStatCard {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly unit = input<string | undefined>(undefined);
  readonly highlight = input(false);

  protected readonly hostClass = computed(
    () =>
      'flex flex-col gap-2.5 p-3.5 md:p-5 bg-bb-surface rounded-lg ' +
      (this.highlight() ? 'border-[1.5px] border-bb-green' : 'border border-bb-border-subtle'),
  );

  protected readonly labelClass = computed(
    () => `text-bb-xs ${this.highlight() ? 'text-bb-text-2' : 'text-bb-text-subtle'}`,
  );

  protected readonly valueClass = computed(() =>
    this.highlight()
      ? 'text-[22px] md:text-[36px] font-bold leading-none break-words text-bb-green'
      : 'text-[28px] md:text-[36px] font-bold leading-none break-words text-bb-text',
  );
}
