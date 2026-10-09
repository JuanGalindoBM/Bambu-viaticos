import type { Routes } from '@angular/router';

/**
 * Rutas de `ui-kit`: el catálogo de desarrollo de `shared/ui/`. No es una pantalla
 * del producto y no usa ninguno de los dos layouts.
 */
export const uiKitRoutes: Routes = [
  {
    path: '',
    title: 'Catálogo de UI',
    loadComponent: () => import('./pages/catalog/catalog').then((m) => m.Catalog),
  },
];
