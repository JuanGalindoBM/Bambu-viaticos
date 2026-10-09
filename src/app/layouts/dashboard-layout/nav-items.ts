import type { BbIconName } from '../../shared/ui';

/**
 * Destino del menú lateral del dashboard (SPEC 04, req. 16).
 *
 * `route` ausente = destino pendiente: la ruta todavía no existe y el elemento se
 * renderiza inerte (`<span aria-disabled="true">`), nunca como `<a>` sin destino.
 */
export interface NavItem {
  readonly label: string;
  readonly icon: BbIconName;
  readonly route?: string;
  /**
   * Reservado por el contrato de SPEC 04 para una futura barra inferior que
   * reutilice esta misma lista. Hoy no se consume: la maqueta del kit
   * (`screens/04-dashboard.html`) tiene un cuarto destino móvil, «Perfil», que no
   * existe en este menú, así que la barra inferior se renderiza con su propia
   * lista (`MOBILE_TAB_ITEMS`) en vez de abreviar esta.
   */
  readonly mobileLabel?: string;
}

/** Los cuatro destinos del menú lateral, en el orden del kit. */
export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Inicio', icon: 'home', route: '/dashboard' },
  { label: 'Mis reportes', icon: 'file-text' },
  { label: 'Nuevo reporte', icon: 'plus-circle' },
  { label: 'Ayuda', icon: 'help-circle' },
];

/**
 * Los cuatro destinos de la barra inferior (solo visible por debajo de `md:`).
 * Es una lista propia, no una abreviación de `NAV_ITEMS`: el cuarto destino del
 * kit en móvil es «Perfil» (icono de persona), que no tiene equivalente en el
 * sidebar de escritorio.
 */
export const MOBILE_TAB_ITEMS: readonly NavItem[] = [
  { label: 'Inicio', icon: 'home', route: '/dashboard' },
  { label: 'Reportes', icon: 'file-text' },
  { label: 'Ayuda', icon: 'help-circle' },
  { label: 'Perfil', icon: 'user' },
];
