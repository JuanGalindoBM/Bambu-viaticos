/**
 * Registro de iconos — única fuente de verdad del design system (SPEC 03, req. 4 y 5).
 *
 * Los 23 iconos están extraídos tal cual de `references/viaticos-bambu-kit/screens/*.html`.
 * Las formas se guardan como datos estructurados —no como cadenas de SVG— para que la
 * plantilla de `bb-icon` las renderice sin pasar por `innerHTML` ni por el sanitizador.
 *
 * El `strokeWidth` es parte de la definición de cada icono, no un input: el kit usa
 * 1.8 para la mayoría, 1.9 para los de navegación, 2 / 2.2 para flechas y signos,
 * y 2.4 para el check del círculo de estatus.
 */

/** Nombre de un icono del registro. */
export type BbIconName =
  | 'mail'
  | 'lock'
  | 'eye'
  | 'eye-off'
  | 'arrow-right'
  | 'arrow-left'
  | 'shield-check'
  | 'key'
  | 'send'
  | 'mail-check'
  | 'clock'
  | 'list'
  | 'check'
  | 'circle'
  | 'user'
  | 'home'
  | 'file-text'
  | 'plus-circle'
  | 'help-circle'
  | 'log-out'
  | 'bell'
  | 'plus'
  | 'report';

/** Una forma dentro de un icono. El viewBox siempre es `0 0 24 24`. */
export type BbIconShape =
  | { readonly kind: 'path'; readonly d: string }
  | { readonly kind: 'circle'; readonly cx: number; readonly cy: number; readonly r: number }
  | {
      readonly kind: 'rect';
      readonly x: number;
      readonly y: number;
      readonly width: number;
      readonly height: number;
      readonly rx: number;
    };

export interface BbIconDefinition {
  readonly strokeWidth: number;
  readonly shapes: readonly BbIconShape[];
}

const path = (d: string): BbIconShape => ({ kind: 'path', d });

export const BB_ICONS: Readonly<Record<BbIconName, BbIconDefinition>> = {
  mail: {
    strokeWidth: 1.8,
    shapes: [{ kind: 'rect', x: 3, y: 5, width: 18, height: 14, rx: 2 }, path('m3 7 9 6 9-6')],
  },
  lock: {
    strokeWidth: 1.8,
    shapes: [
      { kind: 'rect', x: 4, y: 10, width: 16, height: 11, rx: 2 },
      path('M8 10V7a4 4 0 0 1 8 0v3'),
    ],
  },
  eye: {
    strokeWidth: 1.8,
    shapes: [
      path('M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z'),
      { kind: 'circle', cx: 12, cy: 12, r: 3 },
    ],
  },
  'eye-off': {
    strokeWidth: 1.8,
    shapes: [
      path('M3 3l18 18'),
      path(
        'M10.6 6.1A9.8 9.8 0 0 1 12 6c5 0 9 6 9 6a16 16 0 0 1-3.2 3.7M6.6 6.6C4.3 8.1 3 12 3 12s4 6 9 6a8.6 8.6 0 0 0 4.4-1.2',
      ),
      path('M9.9 9.9a3 3 0 0 0 4.2 4.2'),
    ],
  },
  'arrow-right': { strokeWidth: 2, shapes: [path('M5 12h14'), path('m13 6 6 6-6 6')] },
  'arrow-left': { strokeWidth: 2, shapes: [path('M19 12H5'), path('m11 18-6-6 6-6')] },
  'shield-check': {
    strokeWidth: 1.8,
    shapes: [path('M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6l-8-3z'), path('m9 12 2 2 4-4')],
  },
  key: {
    strokeWidth: 1.8,
    shapes: [
      { kind: 'circle', cx: 8, cy: 15, r: 4 },
      path('m10.8 12.2 8.2-8.2'),
      path('m16 7 3 3'),
      path('m14 9 2 2'),
    ],
  },
  send: { strokeWidth: 2, shapes: [path('M22 2 11 13'), path('M22 2 15 22l-4-9-9-4 20-7z')] },
  'mail-check': {
    strokeWidth: 2,
    shapes: [
      path('M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8'),
      path('m3 7 9 6 9-6'),
      path('m16 19 2 2 4-4'),
    ],
  },
  clock: {
    strokeWidth: 1.8,
    shapes: [{ kind: 'circle', cx: 12, cy: 12, r: 9 }, path('M12 7v5l3 2')],
  },
  list: { strokeWidth: 1.8, shapes: [path('M3 6h18'), path('M7 12h10'), path('M10 18h4')] },
  check: { strokeWidth: 2.4, shapes: [path('m5 12 5 5 9-10')] },
  circle: { strokeWidth: 2, shapes: [{ kind: 'circle', cx: 12, cy: 12, r: 8 }] },
  user: {
    strokeWidth: 2,
    shapes: [{ kind: 'circle', cx: 12, cy: 8, r: 4 }, path('M4 21a8 8 0 0 1 16 0')],
  },
  home: { strokeWidth: 1.9, shapes: [path('M3 11 12 4l9 7'), path('M5 10v10h14V10')] },
  'file-text': {
    strokeWidth: 1.8,
    shapes: [path('M7 3h7l5 5v13H7z'), path('M14 3v5h5'), path('M10 13h6'), path('M10 17h6')],
  },
  'plus-circle': {
    strokeWidth: 1.8,
    shapes: [{ kind: 'circle', cx: 12, cy: 12, r: 9 }, path('M12 8v8'), path('M8 12h8')],
  },
  'help-circle': {
    strokeWidth: 1.8,
    shapes: [
      { kind: 'circle', cx: 12, cy: 12, r: 9 },
      path('M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7'),
      path('M12 17h.01'),
    ],
  },
  'log-out': {
    strokeWidth: 1.9,
    shapes: [path('M15 4h4v16h-4'), path('M10 8l-4 4 4 4'), path('M6 12h10')],
  },
  bell: {
    strokeWidth: 1.8,
    shapes: [path('M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8'), path('M10 20a2 2 0 0 0 4 0')],
  },
  plus: { strokeWidth: 2.2, shapes: [path('M12 5v14'), path('M5 12h14')] },
  report: {
    strokeWidth: 1.8,
    shapes: [path('M6 3h12v18l-3-2-3 2-3-2-3 2z'), path('M9 8h6'), path('M9 12h6')],
  },
};

/** Los 23 nombres del registro, en orden de declaración. Lo consume el catálogo. */
export const BB_ICON_NAMES = Object.keys(BB_ICONS) as readonly BbIconName[];
