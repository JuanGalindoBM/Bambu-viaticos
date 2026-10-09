import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { BbBadge, BbLogo } from '../../shared/ui';

/**
 * Shell de las cinco pantallas de auth (SPEC 04): panel de marca a partir de
 * `md:`, header móvil con el logo por debajo. No conoce qué página está
 * montada — cada pantalla emite su propio `<h1>` dentro del `<router-outlet />`.
 */
@Component({
  imports: [RouterOutlet, NgOptimizedImage, BbLogo, BbBadge],
  selector: 'app-auth-layout',
  templateUrl: './auth-layout.html',
})
export class AuthLayout {}
