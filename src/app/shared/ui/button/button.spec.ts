import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { BbButton } from './button';

@Component({
  imports: [BbButton],
  template: `
    <a bb-button href="#destino" [disabled]="disabled" (click)="clicks = clicks + 1">Ir</a>
    <button type="button" bb-button [disabled]="disabled">Enviar</button>
  `,
})
class Host {
  disabled = true;
  clicks = 0;
}

describe('bb-button', () => {
  it('un ancla deshabilitada no navega y expone aria-disabled y tabindex -1', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const anchor: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(anchor.getAttribute('aria-disabled')).toBe('true');
    expect(anchor.getAttribute('tabindex')).toBe('-1');
    // `disabled` no es un atributo válido en un ancla: no debe reflejarse.
    expect(anchor.hasAttribute('disabled')).toBe(false);

    // Para un usuario real el click ni siquiera llega: el ancla deshabilitada
    // no recibe eventos de puntero.
    expect(anchor.className).toContain('pointer-events-none');

    // Y si el evento se despacha de todos modos, la navegación queda cancelada.
    const event = new MouseEvent('click', { cancelable: true, bubbles: true });
    anchor.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it('un botón deshabilitado refleja el atributo nativo', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(button.disabled).toBe(true);
  });

  it('al habilitarse, el ancla recupera la navegación y pierde los atributos de bloqueo', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.disabled = false;
    fixture.detectChanges();

    const anchor: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(anchor.getAttribute('aria-disabled')).toBeNull();
    expect(anchor.getAttribute('tabindex')).toBeNull();

    const event = new MouseEvent('click', { cancelable: true, bubbles: true });
    anchor.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
    expect(fixture.componentInstance.clicks).toBe(1);
  });
});
