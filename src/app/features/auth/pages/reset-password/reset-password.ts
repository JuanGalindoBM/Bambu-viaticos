import { Component, input } from '@angular/core';

@Component({
  selector: 'app-reset-password',
  template: `<h1>Restablecer contraseña</h1>`,
})
export class ResetPassword {
  /**
   * Token del enlace del correo (`/reset-password?token=XXX`), enlazado por
   * `withComponentInputBinding()`. El stub no lo lee ni lo valida: existe para
   * fijar el contrato de la ruta.
   */
  readonly token = input<string>();
}
