import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormField, email, form, required } from '@angular/forms/signals';
import { describe, expect, it } from 'vitest';

import { BbCheckbox } from '../checkbox/checkbox';
import { BbField } from '../field/field';
import { BbInput } from '../input/input';

@Component({
  imports: [BbInput],
  template: `<bb-input [status]="'error'" />`,
})
class StatusErrorHost {}

@Component({
  imports: [BbField, BbInput, BbCheckbox, FormField],
  template: `
    <bb-field label="Correo"><bb-input [formField]="loginForm.email" type="email" /></bb-field>
    <bb-checkbox [formField]="loginForm.remember">Recordarme</bb-checkbox>
  `,
})
class Host {
  readonly model = signal({ email: '', remember: false });
  readonly loginForm = form(this.model, (path) => {
    required(path.email);
    email(path.email);
  });
}

function type(input: HTMLInputElement, value: string): void {
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('bb-input / bb-checkbox con @angular/forms/signals', () => {
  it('escribir en el bb-input actualiza el FieldTree', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type="email"]');
    type(input, 'juan@bambu-techservices.com');
    fixture.detectChanges();

    expect(fixture.componentInstance.model().email).toBe('juan@bambu-techservices.com');
    expect(fixture.componentInstance.loginForm.email().value()).toBe('juan@bambu-techservices.com');
  });

  it('un campo requerido vacío recién renderizado no tiene aria-invalid', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type="email"]');

    expect(fixture.componentInstance.loginForm.email().touched()).toBe(false);
    expect(fixture.componentInstance.loginForm.email().invalid()).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBeNull();
  });

  it('un valor inválido marca el control con aria-invalid al perder el foco', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type="email"]');
    type(input, 'no-es-un-correo');
    input.dispatchEvent(new Event('blur', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.loginForm.email().touched()).toBe(true);
    expect(fixture.componentInstance.loginForm.email().invalid()).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('status="error" sin [formField] marca aria-invalid de inmediato, sin esperar touched', () => {
    const fixture = TestBed.createComponent(StatusErrorHost);
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('marcar el bb-checkbox actualiza el booleano del FieldTree', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const checkbox: HTMLInputElement =
      fixture.nativeElement.querySelector('input[type="checkbox"]');
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.model().remember).toBe(true);
  });
});
