import { describe, expect, it } from 'vitest';

import {
  CHART_PALETTE_NAMES,
  CHART_PALETTE_THEMES,
  getCategoricalColor,
  getMeasureColor,
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
  // Both modes of every theme run the same length, so switching theme or mode never leaves a
  // measure past the end of one column but not the other.
  it.each(Object.keys(CHART_PALETTE_THEMES))('should give the %s theme the same slots in both modes', (name) => {
    const theme = CHART_PALETTE_THEMES[name as keyof typeof CHART_PALETTE_THEMES];
    expect(theme.light).toHaveLength(CHART_PALETTE_THEMES.default.light.length);
    expect(theme.dark).toHaveLength(CHART_PALETTE_THEMES.default.light.length);
  });

  it('should carry more slots than a grouping may use, so a measure selection is not forced to cycle early', () => {
    expect(CHART_PALETTE_THEMES.default.light.length).toBeGreaterThan(MAX_CATEGORICAL_GROUPS);
  });

  // A theme is named for the hue it leads with, because slot one is what an ungrouped chart draws
  // with — so a reordering would quietly change what the name promises.
  it('should lead the jade theme with its green', () => {
    expect(CHART_PALETTE_THEMES.jade.light[0]).toBe('#1fa85c');
    expect(CHART_PALETTE_THEMES.jade.dark[0]).toBe('#34c775');
  });

  it('should lead the ember theme with its deep red', () => {
    expect(CHART_PALETTE_THEMES.ember.light[0]).toBe('#a52a1f');
    expect(CHART_PALETTE_THEMES.ember.dark[0]).toBe('#c0392b');
  });

  it.each(Object.keys(CHART_PALETTE_THEMES))('should not repeat a hue within the %s theme', (name) => {
    const theme = CHART_PALETTE_THEMES[name as keyof typeof CHART_PALETTE_THEMES];
    expect(new Set(theme.light).size).toBe(theme.light.length);
    expect(new Set(theme.dark).size).toBe(theme.dark.length);
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
  // rather than cycling back round to slot one and repeating a colour. The theme still holds hues
  // at that index for a measure selection to use, so the bound has to be explicit.
  it('should fall back to the neutral mark past the grouping cap rather than reading a further slot', () => {
    expect(CHART_PALETTE_THEMES.default.light[MAX_CATEGORICAL_GROUPS]).toBeTruthy();
    expect(getCategoricalColor(MAX_CATEGORICAL_GROUPS, 'light', 'default')).toBe(NEUTRAL_MARK.light);
  });
});

describe('getMeasureColor', () => {
  it('should give each measure its own hue across the whole theme, not just the grouping cap', () => {
    const colors = CHART_PALETTE_THEMES.jade.light.map((_, index) => getMeasureColor(index, 'light', 'jade'));
    expect(colors).toStrictEqual([...CHART_PALETTE_THEMES.jade.light]);
  });

  // A measure line carries its own name in the legend, so a repeated hue is readable in a way a
  // repeated hue across two unlabelled groups would not be.
  it('should cycle back to the first hue once the theme runs out', () => {
    const slots = CHART_PALETTE_THEMES.berry.dark.length;
    expect(getMeasureColor(slots, 'dark', 'berry')).toBe(CHART_PALETTE_THEMES.berry.dark[0]);
  });

  it('should never fall through to the neutral mark, which is reserved for a folded tail', () => {
    expect(getMeasureColor(99, 'light', 'default')).not.toBe(NEUTRAL_MARK.light);
  });
});

describe('getPaletteSwatch', () => {
  it('should preview the theme in slot order, so the swatch matches what the chart will draw', () => {
    expect(getPaletteSwatch('jade', 'light')).toStrictEqual(CHART_PALETTE_THEMES.jade.light);
  });
});
