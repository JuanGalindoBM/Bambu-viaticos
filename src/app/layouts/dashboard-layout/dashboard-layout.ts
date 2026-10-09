import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { BbAvatar, BbIcon, BbIconButton, BbLogo } from '../../shared/ui';
import { MOBILE_TAB_ITEMS, NAV_ITEMS } from './nav-items';

/**
 * Shell del área privada (SPEC 04): sidebar fijo de 248 px + topbar en
 * escritorio, barra inferior fija en móvil. No conoce qué página está
 * montada — cada pantalla emite su propio `<h1>` dentro del `<router-outlet />`.
 */
@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, BbLogo, BbIcon, BbIconButton, BbAvatar],
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.html',
})
export class DashboardLayout {
  protected readonly navItems = NAV_ITEMS;
  protected readonly mobileTabItems = MOBILE_TAB_ITEMS;

  // TODO: lo inyectará el servicio de sesión cuando exista el spec de autenticación.
  protected readonly userName = signal('Juan Manuel Galindo');
  protected readonly userEmail = signal('juanma@bambu-techservices.com');

  // TODO: derivar del `title` de la ruta activa es del spec de navegación; hoy solo
  // existe una ruta hija (`/dashboard`), así que el valor queda fijo.
  protected readonly breadcrumb = signal('Inicio');
}
