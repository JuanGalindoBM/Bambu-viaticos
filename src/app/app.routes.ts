import type { Routes } from '@angular/router';

/**
 * El orden es parte del contrato: `dashboard` va antes que el `path: ''` de auth
 * porque auth vive en la raíz y, declarado primero, se comería el prefijo.
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then((m) => m.dashboardRoutes),
  },
  {
    path: 'ui-kit',
    loadChildren: () => import('./features/ui-kit/ui-kit.routes').then((m) => m.uiKitRoutes),
  },
  {
    path: '',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  { path: '**', redirectTo: 'login' },
];
