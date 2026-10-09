import { Component, input } from '@angular/core';

import { BbIcon } from '../icon/icon';
import type { BbIconName } from '../icon/icon-registry';

/** Píldora informativa: icono verde opcional más texto proyectado. */
@Component({
  selector: 'bb-chip',
  imports: [BbIcon],
  host: {
    class:
      'inline-flex self-start items-center gap-2 px-3 py-1.5 bg-bb-surface ' +
      'border border-bb-border-subtle rounded-full text-sm text-bb-text-2',
  },
  template: `
    @if (icon(); as iconName) {
      <span class="flex text-bb-green"><bb-icon [name]="iconName" [size]="16" /></span>
    }
    <ng-content />
  `,
})
export class BbChip {
  readonly icon = input<BbIconName | undefined>(undefined);
}
