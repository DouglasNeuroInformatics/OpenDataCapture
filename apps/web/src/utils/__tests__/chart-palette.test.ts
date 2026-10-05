import { describe, expect, it } from 'vitest';

import {
  CHART_PALETTE_NAMES,
  CHART_PALETTE_THEMES,
  getCategoricalColor,
  getPaletteSwatch,
  MAX_CATEGORICAL_GROUPS,
  NEUTRAL_MARK
} from '@/utils/chart-palette';

describe('CHART_PALETTE_NAMES', () => {
  // The themes object is alphabetised by eslint, which would otherwise put `default` in the middle.
  it('should offer the default theme first, since that is the one most users want', () => {
    expect(CHART_PALETTE_NAMES[0]).toBe('default');
  });

  it('should list every theme, so none is unreachable from the dropdown', () => {
    expect([...CHART_PALETTE_NAMES].sort()).toStrictEqual(Object.keys(CHART_PALETTE_THEMES).sort());
  });
});

describe('CHART_PALETTE_THEMES', () => {
  it.each(Object.keys(CHART_PALETTE_THEMES))('should give the %s theme a colour per slot in both modes', (name) => {
    const theme = CHART_PALETTE_THEMES[name as keyof typeof CHART_PALETTE_THEMES];
    expect(theme.light).toHaveLength(MAX_CATEGORICAL_GROUPS);
    expect(theme.dark).toHaveLength(MAX_CATEGORICAL_GROUPS);
  });

  // A theme is named for the hue it leads with, because slot one is what an ungrouped chart draws
  // with — so a reordering would quietly change what the name promises.
  it('should lead the jade theme with its green-teal rather than the orange', () => {
    expect(CHART_PALETTE_THEMES.jade.light[0]).toBe('#1baf7a');
    expect(CHART_PALETTE_THEMES.jade.dark[0]).toBe('#199e70');
  });

  it('should not reuse the neutral mark in any theme, which would blur a real group into the folded tail', () => {
    for (const theme of Object.values(CHART_PALETTE_THEMES)) {
      expect(theme.light).not.toContain(NEUTRAL_MARK.light);
      expect(theme.dark).not.toContain(NEUTRAL_MARK.dark);
    }
  });
});

describe('getCategoricalColor', () => {
  it('should return the theme colour for a slot that exists', () => {
    expect(getCategoricalColor(0, 'light', 'berry')).toBe(CHART_PALETTE_THEMES.berry.light[0]);
  });

  // Past the palette the caller is meant to have folded into "Other", so grey is the honest answer
  // rather than cycling back round to slot one and repeating a colour.
  it('should fall back to the neutral mark past the last slot rather than cycling', () => {
    expect(getCategoricalColor(MAX_CATEGORICAL_GROUPS, 'light', 'default')).toBe(NEUTRAL_MARK.light);
  });
});

describe('getPaletteSwatch', () => {
  it('should preview the theme in slot order, so the swatch matches what the chart will draw', () => {
    expect(getPaletteSwatch('jade', 'light')).toStrictEqual(CHART_PALETTE_THEMES.jade.light);
  });
});
