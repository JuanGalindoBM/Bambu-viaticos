import { Component } from '@angular/core';

/** Etiqueta de categoría: borde verde, versalitas espaciadas, sin radio. */
@Component({
  selector: 'bb-badge',
  host: {
    class:
      'inline-block self-start border-[1.5px] border-bb-green px-3 py-1.5 ' +
      'text-bb-badge font-bold tracking-bb-badge text-bb-text',
  },
  template: `<ng-content />`,
})
export class BbBadge {}
