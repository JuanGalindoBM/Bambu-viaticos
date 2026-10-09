import { Component, input } from '@angular/core';

import { BbIconTile } from '../icon-tile/icon-tile';
import type { BbIconName } from '../icon/icon-registry';

/** Estado vacío de una tarjeta o listado. */
@Component({
  selector: 'bb-empty-state',
  imports: [BbIconTile],
  host: {
    class: 'flex flex-col items-center gap-3.5 px-4 py-6 text-center md:px-6 md:py-12',
  },
  template: `
    <bb-icon-tile [icon]="icon()" />
    <p class="m-0 text-[17px] font-bold">{{ title() }}</p>
    <p class="m-0 max-w-[420px] text-sm leading-normal text-bb-text-muted">{{ text() }}</p>
  `,
})
export class BbEmptyState {
  readonly icon = input.required<BbIconName>();
  readonly title = input.required<string>();
  readonly text = input.required<string>();
}
