import { Component, computed, input, isDevMode } from '@angular/core';

import { BB_ICONS, type BbIconDefinition, type BbIconName } from './icon-registry';

/**
 * Icono del design system. Único componente de `shared/ui/` que escribe un `<svg>`
 * (SPEC 03, req. 7): el resto lo consume a través de este selector.
 *
 * Siempre es `aria-hidden` (req. 6). El nombre accesible lo pone el contenedor:
 * el texto de un `bb-button` / `bb-chip`, o el `aria-label` de un `bb-icon-button`.
 */
@Component({
  selector: 'bb-icon',
  host: { class: 'inline-flex shrink-0' },
  template: `
    @if (definition(); as def) {
      <svg
        [attr.width]="size()"
        [attr.height]="size()"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        [attr.stroke-width]="def.strokeWidth"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        @for (shape of def.shapes; track $index) {
          @switch (shape.kind) {
            @case ('path') {
              <svg:path [attr.d]="shape.d" />
            }
            @case ('circle') {
              <svg:circle [attr.cx]="shape.cx" [attr.cy]="shape.cy" [attr.r]="shape.r" />
            }
            @case ('rect') {
              <svg:rect
                [attr.x]="shape.x"
                [attr.y]="shape.y"
                [attr.width]="shape.width"
                [attr.height]="shape.height"
                [attr.rx]="shape.rx"
              />
            }
          }
        }
      </svg>
    }
  `,
})
export class BbIcon {
  readonly name = input.required<BbIconName>();
  /** Lado del icono en px. El viewBox siempre es 24×24. */
  readonly size = input(20);

  /**
   * Un nombre fuera del registro —solo alcanzable si llega como `string` desde datos—
   * no pinta nada y no lanza: un icono faltante no debe tumbar una pantalla.
   */
  protected readonly definition = computed<BbIconDefinition | undefined>(() => {
    const name = this.name();
    const definition = BB_ICONS[name];

    if (!definition && isDevMode()) {
      console.warn(`[bb-icon] No existe el icono "${name}" en el registro.`);
    }

    return definition;
  });
}
