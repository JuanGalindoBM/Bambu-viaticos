import { Component, input } from '@angular/core';

/** Paso numerado del bloque «Cómo funciona». */
@Component({
  selector: 'bb-step',
  host: {
    class: 'flex items-start gap-3.5 p-[18px] border border-bb-border-subtle rounded-lg',
  },
  template: `
    <span
      class="flex size-8 shrink-0 items-center justify-center rounded-full bg-bb-green text-sm font-bold text-bb-on-green"
      >{{ number() }}</span
    >
    <span class="flex flex-col gap-1">
      <span class="text-[15px] font-bold">{{ title() }}</span>
      <span class="text-bb-xs leading-normal text-bb-text-muted">{{ text() }}</span>
    </span>
  `,
})
export class BbStep {
  readonly number = input.required<number>();
  readonly title = input.required<string>();
  readonly text = input.required<string>();
}
