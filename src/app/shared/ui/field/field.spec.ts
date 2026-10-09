import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { BbFormMessage } from '../form-message/form-message';
import { BbInput } from '../input/input';
import { BbField } from './field';

@Component({
  imports: [BbField, BbInput, BbFormMessage],
  template: `
    <bb-field label="Contraseña">
      <bb-input status="error" />
      <bb-form-message tone="error">No coinciden.</bb-form-message>
    </bb-field>
  `,
})
class WithMessage {}

@Component({
  imports: [BbField, BbInput],
  template: `
    <bb-field label="Correo"><bb-input /></bb-field>
    <bb-field label="Correo"><bb-input /></bb-field>
  `,
})
class TwoFields {}

@Component({
  imports: [BbField, BbInput],
  template: `<bb-field label="Correo"><bb-input /></bb-field>`,
})
class WithoutMessage {}

@Component({
  imports: [BbInput],
  template: `<bb-input />`,
})
class Orphan {}

describe('bb-field', () => {
  it('cablea el for de la etiqueta y el aria-describedby del control', () => {
    const fixture = TestBed.createComponent(WithMessage);
    fixture.detectChanges();

    const label: HTMLLabelElement = fixture.nativeElement.querySelector('label');
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    const message: HTMLElement = fixture.nativeElement.querySelector('bb-form-message');

    expect(input.id).toBeTruthy();
    expect(label.getAttribute('for')).toBe(input.id);
    expect(message.id).toBeTruthy();
    expect(input.getAttribute('aria-describedby')).toBe(message.id);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(message.getAttribute('role')).toBe('alert');
  });

  it('no emite aria-describedby cuando no hay mensaje proyectado', () => {
    const fixture = TestBed.createComponent(WithoutMessage);
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.getAttribute('aria-describedby')).toBeNull();
  });

  it('genera ids distintos para dos campos con la misma etiqueta', () => {
    const fixture = TestBed.createComponent(TwoFields);
    fixture.detectChanges();

    const [first, second] = fixture.nativeElement.querySelectorAll('input');
    expect(first.id).not.toBe(second.id);

    const [firstLabel, secondLabel] = fixture.nativeElement.querySelectorAll('label');
    expect(firstLabel.getAttribute('for')).toBe(first.id);
    expect(secondLabel.getAttribute('for')).toBe(second.id);
  });

  it('un bb-input fuera de un bb-field no rompe y usa su propio id', () => {
    const fixture = TestBed.createComponent(Orphan);
    expect(() => fixture.detectChanges()).not.toThrow();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.id).toMatch(/^bb-input-\d+$/);
  });
});
