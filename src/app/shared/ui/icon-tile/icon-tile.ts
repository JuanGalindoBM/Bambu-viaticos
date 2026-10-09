import { Component, input } from '@angular/core';

import { BbIcon } from '../icon/icon';
import type { BbIconName } from '../icon/icon-registry';

/**
 * Cuadro de 56×56 px con borde verde. Cubre tanto `.tile` como `.empty__icon`
 * del kit, que son la misma caja declarada dos veces.
 */
@Component({
  selector: 'bb-icon-tile',
  imports: [BbIcon],
  host: {
    class:
      'inline-flex size-14 shrink-0 items-center justify-center bg-bb-surface ' +
      'border-[1.5px] border-bb-green rounded-lg text-bb-green',
  },
  template: `<bb-icon [name]="icon()" [size]="26" />`,
})
export class BbIconTile {
  readonly icon = input.required<BbIconName>();
}
