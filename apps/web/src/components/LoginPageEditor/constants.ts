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

export const RIGHT_PANEL_LABELS: { [K in RightPanelOption]: { en: string; fr: string } } = {
  custom: { en: 'Custom', fr: 'Personnalisé' },
  forest: { en: 'Forest', fr: 'Forêt' },
  midnight: { en: 'Midnight', fr: 'Minuit' },
  none: { en: 'Default', fr: 'Par défaut' },
  ocean: { en: 'Ocean', fr: 'Océan' },
  rose: { en: 'Rose', fr: 'Rose' },
  slate: { en: 'Slate', fr: 'Ardoise' },
  violet: { en: 'Violet', fr: 'Violet' }
};

export const THEME_LABELS: { [K in LoginTheme]: { en: string; fr: string } } = {
  custom: { en: 'Custom', fr: 'Personnalisé' },
  forest: { en: 'Forest', fr: 'Forêt' },
  midnight: { en: 'Midnight', fr: 'Minuit' },
  ocean: { en: 'Ocean', fr: 'Océan' },
  rose: { en: 'Rose', fr: 'Rose' },
  slate: { en: 'Slate', fr: 'Ardoise' },
  sunset: { en: 'Sunset', fr: 'Coucher de soleil' },
  violet: { en: 'Violet', fr: 'Violet' }
};

export const LOGO_SIZE_LABELS: { [K in LogoSize]: { en: string; fr: string } } = {
  custom: { en: 'Custom', fr: 'Personnalisé' },
  large: { en: 'Large', fr: 'Grand' },
  medium: { en: 'Medium', fr: 'Moyen' },
  small: { en: 'Small', fr: 'Petit' },
  xlarge: { en: 'Extra Large', fr: 'Très grand' }
};

export const LOGO_ALIGNMENT_LABELS: { [K in LogoAlignment]: { en: string; fr: string } } = {
  center: { en: 'Center', fr: 'Centre' },
  left: { en: 'Left', fr: 'Gauche' },
  right: { en: 'Right', fr: 'Droite' }
};

export const SECTION_TITLES: { [K in PanelSection]: { en: string; fr: string } } = {
  details: { en: 'Details', fr: 'Détails' },
  logo: { en: 'Login Image', fr: 'Image de connexion' },
  name: { en: 'Instance Name', fr: "Nom de l'instance" },
  resources: { en: 'Resources', fr: 'Ressources' },
  tagline: { en: 'Main Description', fr: 'Description principale' }
};

export const DEFAULT_SECTIONS_ORDER: PanelSection[] = ['logo', 'name', 'tagline', 'details', 'resources'];
export const HEX_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
/** Accept http(s) URLs with a hostname containing at least one dot (e.g. example.com). */
export const URL_PATTERN = /^https?:\/\/[^\s/]+\.[^\s/]+(\/\S*)?$/;
export const MAX_LOGO_BYTES = 2 * 1024 * 1024;
export const FORM_ID = 'branding-form';
/** Sentinel Select value representing "no override — use the default font size". */
export const FONT_SIZE_DEFAULT = 'default';
/** Seed color for the left-panel text picker — matches the panel's default `text-slate-100`. */
export const DEFAULT_PANEL_TEXT_COLOR = '#f1f5f9';
