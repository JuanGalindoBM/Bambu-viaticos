import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { BbAvatar } from './avatar';

@Component({
  imports: [BbAvatar],
  template: `<bb-avatar [name]="name" />`,
})
class Host {
  name = '';
}

function initialsFor(name: string): string {
  const fixture = TestBed.createComponent(Host);
  fixture.componentInstance.name = name;
  fixture.detectChanges();
  return fixture.nativeElement.querySelector('bb-avatar').textContent.trim();
}

describe('bb-avatar', () => {
  it('deriva dos iniciales de la primera y la última palabra', () => {
    expect(initialsFor('Juan Manuel Galindo')).toBe('JG');
  });

  it('deriva una sola inicial de un nombre de una palabra, conservando el acento', () => {
    expect(initialsFor('Ángel')).toBe('Á');
  });

  it('no renderiza iniciales con un nombre vacío', () => {
    expect(initialsFor('')).toBe('');
    expect(initialsFor('   ')).toBe('');
  });

  it('se oculta a los lectores de pantalla porque el nombre va a su lado', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('bb-avatar').getAttribute('aria-hidden')).toBe(
      'true',
    );
  });
});
