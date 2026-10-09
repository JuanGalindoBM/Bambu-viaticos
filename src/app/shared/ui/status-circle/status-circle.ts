import { Component, input } from '@angular/core';

import { BbIcon } from '../icon/icon';
import type { BbIconName } from '../icon/icon-registry';

/** Círculo verde relleno de 64 px: el acuse de las pantallas de confirmación. */
@Component({
  selector: 'bb-status-circle',
  imports: [BbIcon],
  host: {
    class:
      'inline-flex size-16 shrink-0 items-center justify-center rounded-full ' +
      'bg-bb-green text-bb-on-green',
  },
  template: `<bb-icon [name]="icon()" [size]="30" />`,
})
export class BbStatusCircle {
  readonly icon = input.required<BbIconName>();
}
