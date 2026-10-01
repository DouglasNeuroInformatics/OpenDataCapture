import type { LoginTheme, LogoAlignment, LogoSize, PanelSection } from '@opendatacapture/schemas/setup';

/**
 * Options for the right-panel theme picker: 'default' (no override) + a curated
 * subset of LoginTheme values. Sunset is intentionally omitted to keep the
 * swatch grid at 8 cells (2 rows × 4 columns).
 */
export const RIGHT_PANEL_OPTIONS = [
  'none',
  'slate',
  'ocean',
  'forest',
  'violet',
  'rose',
  'midnight',
  'custom'
] as const;
export type RightPanelOption = (typeof RIGHT_PANEL_OPTIONS)[number];

export const RIGHT_PANEL_LABELS: { [K in RightPanelOption]: { en: string; es: string; fr: string } } = {
  custom: { en: 'Custom', es: 'Personalizado', fr: 'Personnalisé' },
  forest: { en: 'Forest', es: 'Bosque', fr: 'Forêt' },
  midnight: { en: 'Midnight', es: 'Medianoche', fr: 'Minuit' },
  none: { en: 'Default', es: 'Predeterminado', fr: 'Par défaut' },
  ocean: { en: 'Ocean', es: 'Océano', fr: 'Océan' },
  rose: { en: 'Rose', es: 'Rosa', fr: 'Rose' },
  slate: { en: 'Slate', es: 'Pizarra', fr: 'Ardoise' },
  violet: { en: 'Violet', es: 'Violeta', fr: 'Violet' }
};

export const THEME_LABELS: { [K in LoginTheme]: { en: string; es: string; fr: string } } = {
  custom: { en: 'Custom', es: 'Personalizado', fr: 'Personnalisé' },
  forest: { en: 'Forest', es: 'Bosque', fr: 'Forêt' },
  midnight: { en: 'Midnight', es: 'Medianoche', fr: 'Minuit' },
  ocean: { en: 'Ocean', es: 'Océano', fr: 'Océan' },
  rose: { en: 'Rose', es: 'Rosa', fr: 'Rose' },
  slate: { en: 'Slate', es: 'Pizarra', fr: 'Ardoise' },
  sunset: { en: 'Sunset', es: 'Atardecer', fr: 'Coucher de soleil' },
  violet: { en: 'Violet', es: 'Violeta', fr: 'Violet' }
};

export const LOGO_SIZE_LABELS: { [K in LogoSize]: { en: string; es: string; fr: string } } = {
  custom: { en: 'Custom', es: 'Personalizado', fr: 'Personnalisé' },
  large: { en: 'Large', es: 'Grande', fr: 'Grand' },
  medium: { en: 'Medium', es: 'Mediano', fr: 'Moyen' },
  small: { en: 'Small', es: 'Pequeño', fr: 'Petit' },
  xlarge: { en: 'Extra Large', es: 'Extra grande', fr: 'Très grand' }
};

export const LOGO_ALIGNMENT_LABELS: { [K in LogoAlignment]: { en: string; es: string; fr: string } } = {
  center: { en: 'Center', es: 'Centro', fr: 'Centre' },
  left: { en: 'Left', es: 'Izquierda', fr: 'Gauche' },
  right: { en: 'Right', es: 'Derecha', fr: 'Droite' }
};

export const SECTION_TITLES: { [K in PanelSection]: { en: string; es: string; fr: string } } = {
  details: { en: 'Details', es: 'Detalles', fr: 'Détails' },
  logo: { en: 'Login Image', es: 'Imagen de inicio de sesión', fr: 'Image de connexion' },
  name: { en: 'Instance Name', es: 'Nombre de la instancia', fr: "Nom de l'instance" },
  resources: { en: 'Resources', es: 'Recursos', fr: 'Ressources' },
  tagline: { en: 'Main Description', es: 'Descripción principal', fr: 'Description principale' }
};

export const DEFAULT_SECTIONS_ORDER: PanelSection[] = ['logo', 'name', 'tagline', 'details', 'resources'];
export const HEX_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
/** Accept http(s) URLs with a hostname containing at least one dot (e.g. example.com). */
export const URL_PATTERN = /^https?:\/\/[^\s/]+\.[^\s/]+(\/\S*)?$/;
export const MAX_LOGO_BYTES = 2 * 1024 * 1024;
/**
 * Image types accepted for the uploaded login image. Drives both the file input's
 * `accept` hint and the post-selection check in `handleLogoFile` — the hint alone
 * is advisory, since the OS picker lets the user override it with "All Files".
 */
export const ACCEPTED_LOGO_MIME_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'] as const;
export const FORM_ID = 'branding-form';
/** Sentinel Select value representing "no override — use the default font size". */
export const FONT_SIZE_DEFAULT = 'default';
/** Seed color for the left-panel text picker — matches the panel's default `text-slate-100`. */
export const DEFAULT_PANEL_TEXT_COLOR = '#f1f5f9';
