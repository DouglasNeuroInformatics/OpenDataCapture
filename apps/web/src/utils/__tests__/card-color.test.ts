import { cn } from '@douglasneuroinformatics/libui/utils';
import { DARK_CARD_THEMES, LIGHT_CARD_THEMES } from '@opendatacapture/schemas/setup';
import { describe, expect, it } from 'vitest';

import {
  CARD_THEME_LABELS,
  DEFAULT_CUSTOM_CARD_COLOR,
  getDarkCardShades,
  getInstanceCardStyle,
  getLightCardShades,
  PAGE_SUBMIT_BUTTON
} from '../card-color';

describe('getLightCardShades', () => {
  it('should draw nothing for an invisible card', () => {
    expect(getLightCardShades().invisible).toEqual({ border: 'transparent', fill: 'transparent' });
  });

  it('should fill a custom theme with the stored color and darken its border', () => {
    expect(getLightCardShades('#123456').custom).toEqual({
      border: 'color-mix(in oklab, #123456 88%, black)',
      fill: '#123456'
    });
  });

  it('should fall back to a default before a custom color is set', () => {
    expect(getLightCardShades(null).custom.fill).toBe(DEFAULT_CUSTOM_CARD_COLOR.light);
  });

  it('should offer six themes beside no color and custom', () => {
    expect(LIGHT_CARD_THEMES.filter((theme) => theme !== 'invisible' && theme !== 'custom')).toHaveLength(6);
  });
});

describe('getDarkCardShades', () => {
  it('should draw nothing for an invisible card', () => {
    expect(getDarkCardShades().invisible).toEqual({ border: 'transparent', fill: 'transparent' });
  });

  it('should lighten the border of a custom theme, so it shows against a dark page', () => {
    expect(getDarkCardShades('#123456').custom.border).toContain('white');
  });

  it('should fall back to a default before a custom color is set', () => {
    expect(getDarkCardShades(null).custom.fill).toBe(DEFAULT_CUSTOM_CARD_COLOR.dark);
  });

  it('should offer six themes beside no color and custom', () => {
    expect(DARK_CARD_THEMES.filter((theme) => theme !== 'invisible' && theme !== 'custom')).toHaveLength(6);
  });
});

describe('getInstanceCardStyle', () => {
  it('should set each mode from its own theme, so one can have no color', () => {
    const style = getInstanceCardStyle({ darkCardTheme: 'invisible', lightCardTheme: 'silver' });
    expect(style['--instance-card-fill-light']).toBe(getLightCardShades().silver.fill);
    expect(style['--instance-card-fill-dark']).toBe('transparent');
    expect(style['--instance-card-border-dark']).toBe('transparent');
  });
});

describe('CARD_THEME_LABELS', () => {
  it.each([...LIGHT_CARD_THEMES, ...DARK_CARD_THEMES])('should name %s in every language', (theme) => {
    expect(Object.keys(CARD_THEME_LABELS[theme]).sort()).toEqual(['en', 'es', 'fr']);
  });
});

describe('PAGE_SUBMIT_BUTTON', () => {
  it("should win over the full width of libui's submit button, so it does not read as a bar", () => {
    expect(cn('flex w-full', PAGE_SUBMIT_BUTTON).split(' ')).not.toContain('w-full');
  });
});
