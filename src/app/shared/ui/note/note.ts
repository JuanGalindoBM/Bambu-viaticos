import { Component, input } from '@angular/core';

import { BbIcon } from '../icon/icon';
import type { BbIconName } from '../icon/icon-registry';

/** Aviso con icono: el callout de seguridad y de ayuda del kit. */
@Component({
  selector: 'bb-note',
  imports: [BbIcon],
  host: {
    class:
      'flex items-start gap-3.5 p-4 bg-bb-surface border border-bb-border-subtle ' +
      'rounded-md text-sm leading-normal text-bb-text-muted',
  },
  template: `
    <span class="mt-px flex text-bb-green"><bb-icon [name]="icon()" [size]="22" /></span>
    <span class="min-w-0"><ng-content /></span>
  `,
})
export class BbNote {
  readonly icon = input<BbIconName>('shield-check');
}
