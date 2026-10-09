import { Component, ElementRef, booleanAttribute, computed, inject, input } from '@angular/core';

export type BbButtonVariant = 'primary' | 'secondary';
export type BbButtonSize = 'md' | 'lg';
export type BbButtonFit = 'inline' | 'block' | 'block-mobile';

const BASE =
  'inline-flex items-center justify-center gap-2.5 rounded-md no-underline transition-colors';

/**
 * Botón del design system. Usa selector de atributo (SPEC 03, req. 8) para que el
 * consumidor decida el elemento nativo: `routerLink`, `type` y `href` siguen siendo
 * atributos propios del host.
 *
 * Las tres combinaciones que el kit usa hoy (req. 10):
 * - `lg` / `block` primario y secundario — botones de auth.
 * - `md` / `block-mobile` primario — botón del encabezado del dashboard.
 *
 * El alto va siempre en `min-height`, nunca `height` (req. 11): con el texto al 200 %
 * un alto fijo recortaría el contenido.
 */
@Component({
  selector: 'button[bb-button], a[bb-button]',
  host: {
    '[class]': 'hostClass()',
    '[attr.disabled]': 'isAnchor ? null : disabled() ? "" : null',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.tabindex]': 'isAnchor && disabled() ? "-1" : null',
    '(click)': 'onClick($event)',
  },
  template: `<ng-content />`,
})
export class BbButton {
  readonly variant = input<BbButtonVariant>('primary');
  readonly size = input<BbButtonSize>('lg');
  readonly fit = input<BbButtonFit>('block');
  /**
   * En un `<button>` se refleja al atributo nativo. En un `<a>`, que no admite
   * `disabled`, se traduce a `aria-disabled`, `tabindex="-1"` y bloqueo del click.
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly isAnchor =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName === 'A';

  private readonly minHeightClass = computed(() => {
    if (this.size() === 'lg') return 'min-h-bb-control';
    return this.fit() === 'block-mobile' ? 'min-h-bb-control md:min-h-12' : 'min-h-12';
  });

  private readonly fontSizeClass = computed(() => {
    if (this.variant() === 'secondary') return 'text-[15px]';
    if (this.size() === 'lg') return 'text-base';
    return this.fit() === 'block-mobile' ? 'text-base md:text-[15px]' : 'text-[15px]';
  });

  private readonly fitClass = computed(() => {
    switch (this.fit()) {
      case 'inline':
        return 'w-auto px-5';
      case 'block-mobile':
        return 'w-full md:w-auto md:px-5';
      default:
        return 'w-full';
    }
  });

  private readonly variantClass = computed(() => {
    const secondary = this.variant() === 'secondary';

    if (this.disabled()) {
      // `pointer-events-none` es lo que de verdad bloquea el click en un `<a>`: un
      // host listener no puede impedir que corra el `(click)` del propio consumidor,
      // porque Angular registra los listeners del template antes que los del host.
      const blocked = this.isAnchor ? 'pointer-events-none' : 'cursor-not-allowed';
      return secondary
        ? `bg-transparent border border-bb-border text-bb-placeholder font-normal ${blocked}`
        : `bg-bb-surface-2 border-0 text-bb-placeholder font-bold ${blocked}`;
    }

    return secondary
      ? 'bg-transparent border border-bb-border text-bb-text-subtle font-normal cursor-pointer'
      : 'bg-bb-green border-0 text-bb-on-green font-bold cursor-pointer hover:bg-bb-green-hover';
  });

  protected readonly hostClass = computed(
    () =>
      `${BASE} ${this.minHeightClass()} ${this.fontSizeClass()} ${this.fitClass()} ${this.variantClass()}`,
  );

  protected onClick(event: Event): void {
    if (!this.disabled()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}
