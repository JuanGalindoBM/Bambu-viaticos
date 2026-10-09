import { NgOptimizedImage } from '@angular/common';
import { Component, computed, input } from '@angular/core';

/** Relación del archivo original (2000×741) conservada al reescalar a 528×196. */
const ASPECT_RATIO = 2.699;

/**
 * Logotipo de Bambú Tech Services.
 *
 * ⚠️ Solo es válido sobre un fondo `bb-black`. El archivo es un JPEG **sin canal
 * alfa y con fondo negro opaco**: sobre cualquier otra superficie —incluido el gris
 * casi negro del menú lateral del kit— dibuja un rectángulo visible. Si hace falta
 * el logo sobre otro fondo, hay que pedirle a diseño un SVG o un PNG con
 * transparencia; recortar el fondo del JPEG deja halo alrededor de los glifos.
 */
@Component({
  selector: 'bb-logo',
  imports: [NgOptimizedImage],
  host: { class: 'inline-block' },
  template: `
    <img
      ngSrc="/img/logo-bambu.jpg"
      alt="Bambú Tech Services"
      [width]="width()"
      [height]="height()"
      [priority]="priority()"
      class="block max-w-full"
    />
  `,
})
export class BbLogo {
  readonly width = input(176);
  readonly priority = input(false);

  protected readonly height = computed(() => Math.round(this.width() / ASPECT_RATIO));
}
