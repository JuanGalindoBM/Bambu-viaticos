import type { Routes } from '@angular/router';

/**
 * Rutas de `auth`. Todo lazy: una página importada estáticamente aquí deja de tener chunk propio.
 *
 * Las rutas de dos segmentos van antes que su prefijo de un segmento
 * (`forgot-password/sent` antes de `forgot-password`) para no depender del
 * backtracking del router entre hermanos.
 */
export const authRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('../../layouts/auth-layout/auth-layout').then((m) => m.AuthLayout),
    children: [
      {
        path: 'login',
        title: 'Iniciar sesión',
        loadComponent: () => import('./pages/login/login').then((m) => m.Login),
      },
      {
        path: 'forgot-password/sent',
        title: 'Correo enviado',
        loadComponent: () =>
          import('./pages/forgot-password-sent/forgot-password-sent').then(
            (m) => m.ForgotPasswordSent,
          ),
      },
      {
        path: 'forgot-password',
        title: 'Olvidé mi contraseña',
        loadComponent: () =>
          import('./pages/forgot-password/forgot-password').then((m) => m.ForgotPassword),
      },
      {
        path: 'reset-password/done',
        title: 'Contraseña actualizada',
        loadComponent: () =>
          import('./pages/reset-password-done/reset-password-done').then(
            (m) => m.ResetPasswordDone,
          ),
      },
      {
        path: 'reset-password',
        title: 'Restablecer contraseña',
        loadComponent: () =>
          import('./pages/reset-password/reset-password').then((m) => m.ResetPassword),
      },
    ],
  },
];
