import { Component, computed, input } from '@angular/core';

/**
 * Iniciales del usuario en un círculo verde de 40 px.
 *
 * Es `aria-hidden` porque el nombre completo siempre se renderiza a su lado: anunciar
 * «JG» además de «Juan Manuel Galindo» solo añade ruido.
 */
@Component({
  selector: 'bb-avatar',
  host: {
    class:
      'inline-flex size-10 shrink-0 items-center justify-center rounded-full ' +
      'border-[1.5px] border-bb-green text-sm font-bold text-bb-green',
    'aria-hidden': 'true',
  },
  template: `{{ initials() }}`,
})
export class BbAvatar {
  readonly name = input.required<string>();

  /**
   * Primera y última palabra del nombre. Con una sola palabra, una inicial; sin
   * nombre, ninguna. Los acentos se conservan (`Ángel` → `Á`), no se normalizan.
   */
  protected readonly initials = computed(() => {
    const words = this.name().trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return '';
    const first = words[0].charAt(0);
    const last = words.length > 1 ? words[words.length - 1].charAt(0) : '';
    return `${first}${last}`.toLocaleUpperCase('es');
  });
}
