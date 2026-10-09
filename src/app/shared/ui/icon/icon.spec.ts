import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import { BbIcon } from './icon';
import { BB_ICON_NAMES, type BbIconName } from './icon-registry';

@Component({
  imports: [BbIcon],
  template: `<bb-icon [name]="name" />`,
})
class Host {
  name = 'mail' as BbIconName;
}

describe('bb-icon', () => {
  it('registra exactamente los 23 iconos del kit', () => {
    expect(BB_ICON_NAMES).toHaveLength(23);
  });

  it('renderiza el svg del icono con el stroke-width de su definición', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg.getAttribute('stroke-width')).toBe('1.8');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.querySelectorAll('rect, path, circle')).toHaveLength(2);
  });

  it('con un nombre fuera del registro no lanza, no pinta nada y avisa en consola', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.name = 'no-existe' as BbIconName;

    expect(() => fixture.detectChanges()).not.toThrow();
    expect(fixture.nativeElement.querySelector('svg')).toBeNull();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no-existe'));

    warn.mockRestore();
  });
});
