import {
  Component,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  isDevMode,
} from '@angular/core';

export type BbIconButtonVariant = 'ghost' | 'outlined';

const BASE =
  'inline-flex items-center justify-center min-w-bb-touch min-h-bb-touch rounded-md ' +
  'bg-transparent cursor-pointer transition-colors';

/**
 * Botón de solo icono, 44×44 px (`--bb-touch`).
 *
 * - `ghost`: el botón de mostrar/ocultar contraseña dentro de un `bb-input` (sin borde).
 * - `outlined`: el de la topbar del dashboard (borde `bb-border`, verde en hover).
 *
 * El nombre accesible lo pone el consumidor con `aria-label` o `aria-labelledby`:
 * el componente no puede inventarlo, y sin él AXE lo reporta como violación.
 */
@Component({
  selector: 'button[bb-icon-button]',
  host: { '[class]': 'hostClass()' },
  template: `<ng-content />`,
})
export class BbIconButton {
  readonly variant = input<BbIconButtonVariant>('ghost');

  protected readonly hostClass = computed(() =>
    this.variant() === 'outlined'
      ? `${BASE} border border-bb-border text-bb-text-2 hover:text-bb-green hover:border-bb-green`
      : `${BASE} border-0 text-bb-text-subtle hover:text-bb-green`,
  );

  constructor() {
    if (isDevMode()) {
      const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
      afterNextRender(() => {
        if (!host.hasAttribute('aria-label') && !host.hasAttribute('aria-labelledby')) {
          console.warn(
            '[bb-icon-button] Falta `aria-label` o `aria-labelledby`: el botón no tiene nombre accesible.',
            host,
          );
        }
      });
    }
  }
}
