import type { Routes } from '@angular/router';

/** Rutas de `dashboard`. Todo lazy: una página importada estáticamente aquí deja de tener chunk propio. */
export const dashboardRoutes: Routes = [
  {
    path: '',
    // canActivate: [authGuard] — lo agrega el spec de autenticación.
    loadComponent: () =>
      import('../../layouts/dashboard-layout/dashboard-layout').then((m) => m.DashboardLayout),
    children: [
      {
        path: '',
        title: 'Inicio',
        loadComponent: () => import('./pages/home/home').then((m) => m.Home),
      },
    ],
  },
];
