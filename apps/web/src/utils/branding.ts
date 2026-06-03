import type { BrandingConfig, LoginTheme } from '@opendatacapture/schemas/setup';

export type LoginThemeColors = {
  primary: string;
  secondary: string;
};

/** The curated gradient palettes, keyed by theme name. */
export const LOGIN_THEME_COLORS: Record<Exclude<LoginTheme, 'custom'>, LoginThemeColors> = {
  forest: { primary: '#10b981', secondary: '#064e3b' },
  midnight: { primary: '#1f2937', secondary: '#020617' },
  ocean: { primary: '#0ea5e9', secondary: '#0c4a6e' },
  rose: { primary: '#fb7185', secondary: '#881337' },
  slate: { primary: '#475569', secondary: '#0f172a' },
  sunset: { primary: '#fb923c', secondary: '#9a3412' },
  violet: { primary: '#8b5cf6', secondary: '#3b0764' }
};

export const DEFAULT_LOGIN_THEME = 'slate' satisfies LoginTheme;

/**
 * Resolve the effective gradient colors for the given branding configuration,
 * falling back to the default theme when nothing is configured.
 */
export function resolveLoginThemeColors(branding?: BrandingConfig | null): LoginThemeColors {
  const theme = branding?.loginTheme ?? DEFAULT_LOGIN_THEME;
  if (theme === 'custom') {
    return {
      primary: branding?.customPrimaryColor ?? LOGIN_THEME_COLORS.slate.primary,
      secondary: branding?.customSecondaryColor ?? LOGIN_THEME_COLORS.slate.secondary
    };
  }
  return LOGIN_THEME_COLORS[theme] ?? LOGIN_THEME_COLORS.slate;
}

/** Build the CSS `linear-gradient(...)` used by the login branding panel. */
export function getLoginGradient(branding?: BrandingConfig | null): string {
  const { primary, secondary } = resolveLoginThemeColors(branding);
  return `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`;
}

/**
 * Build the CSS `linear-gradient(...)` for the right-hand login form panel,
 * or `null` if no right-panel theme is configured (uses default background).
 */
export function getRightPanelGradient(branding?: BrandingConfig | null): null | string {
  const theme = branding?.rightPanelTheme;
  if (!theme) return null;
  if (theme === 'custom') {
    const primary = branding?.rightPanelPrimaryColor ?? LOGIN_THEME_COLORS.slate.primary;
    const secondary = branding?.rightPanelSecondaryColor ?? LOGIN_THEME_COLORS.slate.secondary;
    return `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`;
  }
  const colors = LOGIN_THEME_COLORS[theme] ?? LOGIN_THEME_COLORS.slate;
  return `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`;
}
