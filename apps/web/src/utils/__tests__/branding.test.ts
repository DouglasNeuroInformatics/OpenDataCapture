import type { BrandingConfig } from '@opendatacapture/schemas/setup';
import { describe, expect, it } from 'vitest';

import {
  DEFAULT_LOGIN_THEME,
  getLoginGradient,
  getRightPanelGradient,
  LOGIN_THEME_COLORS,
  resolveLoginThemeColors
} from '../branding';

/** A theme name persisted by another release, which this build's types do not know about. */
const brandingWithUnknownTheme = (key: 'loginTheme' | 'rightPanelTheme'): BrandingConfig =>
  JSON.parse(JSON.stringify({ [key]: 'retired' }));

describe('resolveLoginThemeColors', () => {
  it('should use the default theme when no branding is configured', () => {
    expect(resolveLoginThemeColors()).toEqual(LOGIN_THEME_COLORS[DEFAULT_LOGIN_THEME]);
  });

  it('should use the default theme when branding is null', () => {
    expect(resolveLoginThemeColors(null)).toEqual(LOGIN_THEME_COLORS.slate);
  });

  it('should use the default theme when branding sets no login theme', () => {
    expect(resolveLoginThemeColors({ loginTheme: null })).toEqual(LOGIN_THEME_COLORS.slate);
  });

  it('should use the palette of a curated theme', () => {
    expect(resolveLoginThemeColors({ loginTheme: 'ocean' })).toEqual(LOGIN_THEME_COLORS.ocean);
  });

  it('should use the custom colors when the theme is custom', () => {
    expect(
      resolveLoginThemeColors({ customPrimaryColor: '#111111', customSecondaryColor: '#222222', loginTheme: 'custom' })
    ).toEqual({ primary: '#111111', secondary: '#222222' });
  });

  it('should fill each missing custom color from the default theme, so a half-configured gradient still renders', () => {
    expect(resolveLoginThemeColors({ loginTheme: 'custom' })).toEqual(LOGIN_THEME_COLORS.slate);
  });

  it('should fall back to the default palette for an unknown theme rather than rendering no gradient', () => {
    expect(resolveLoginThemeColors(brandingWithUnknownTheme('loginTheme'))).toEqual(LOGIN_THEME_COLORS.slate);
  });
});

describe('getLoginGradient', () => {
  it('should build a diagonal gradient from the resolved primary to secondary color', () => {
    expect(getLoginGradient({ loginTheme: 'rose' })).toBe('linear-gradient(135deg, #fb7185 0%, #881337 100%)');
  });

  it('should build the default gradient when no branding is configured', () => {
    expect(getLoginGradient()).toBe('linear-gradient(135deg, #475569 0%, #0f172a 100%)');
  });
});

describe('getRightPanelGradient', () => {
  it('should return null when no branding is configured, so the panel keeps its default background', () => {
    expect(getRightPanelGradient()).toBeNull();
  });

  it('should return null when branding sets no right panel theme', () => {
    expect(getRightPanelGradient({ loginTheme: 'ocean', rightPanelTheme: null })).toBeNull();
  });

  it('should build the gradient of a curated theme', () => {
    expect(getRightPanelGradient({ rightPanelTheme: 'forest' })).toBe(
      'linear-gradient(135deg, #10b981 0%, #064e3b 100%)'
    );
  });

  it('should build the gradient from the right panel custom colors, independently of the login theme', () => {
    expect(
      getRightPanelGradient({
        customPrimaryColor: '#999999',
        rightPanelPrimaryColor: '#111111',
        rightPanelSecondaryColor: '#222222',
        rightPanelTheme: 'custom'
      })
    ).toBe('linear-gradient(135deg, #111111 0%, #222222 100%)');
  });

  it('should fill each missing custom color from the default theme', () => {
    expect(getRightPanelGradient({ rightPanelTheme: 'custom' })).toBe(
      'linear-gradient(135deg, #475569 0%, #0f172a 100%)'
    );
  });

  it('should fall back to the default gradient for an unknown theme', () => {
    expect(getRightPanelGradient(brandingWithUnknownTheme('rightPanelTheme'))).toBe(
      'linear-gradient(135deg, #475569 0%, #0f172a 100%)'
    );
  });
});
