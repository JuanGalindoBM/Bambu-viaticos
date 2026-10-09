import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { BbCard } from './card';

@Component({
  imports: [BbCard],
  template: `
    <bb-card [heading]="heading">
      <a bbCardAction href="#todos">Ver todos</a>
      <p>Cuerpo</p>
    </bb-card>
  `,
})
class Host {
  heading: string | undefined = undefined;
}

describe('bb-card', () => {
  it('sin heading no renderiza ni el encabezado ni la acción proyectada', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h2')).toBeNull();
    expect(fixture.nativeElement.querySelector('a[bbCardAction]')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Cuerpo');
  });

  it('con heading renderiza el encabezado y la acción', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.heading = 'Reportes recientes';
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h2').textContent).toContain('Reportes recientes');
    expect(fixture.nativeElement.querySelector('a[bbCardAction]')).not.toBeNull();
  });
});
