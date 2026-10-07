/**
 * The categorical palettes every datahub chart draws with, so the instrument and subject graphs
 * read the same way and a reader moving between them is not relearning the colours.
 *
 * Each theme leads with the three hues it is named for, then carries three more in the same key.
 * The two consumers take different amounts of that run: a grouping dimension stops at
 * `MAX_CATEGORICAL_GROUPS` and folds its tail into `OTHER_GROUP_KEY`, because an unbounded legend
 * of near-hues is unreadable; a measure selection has a named line per entry and so spends the
 * whole run before cycling.
 *
 * Each theme's dark column is the same hues re-stepped for the dark surface, not an inversion of
 * the light one.
 *
 * - default: white / grey / light blue, then steel, slate and pale cyan.
 * - berry: blue / purple / pink, then indigo, magenta and rose.
 * - jade: green / yellow / orange, then teal, olive and red-orange.
 * - ember: deep red / light yellow / beige, then burnt orange, olive and taupe.
 */
const CHART_PALETTE_THEMES = {
  berry: {
    dark: ['#5b9bd5', '#9b72cb', '#e57aad', '#6b5bd5', '#c850c8', '#e8859b'],
    light: ['#3a7cc6', '#7b4fb8', '#d4548e', '#4a3cb5', '#a830a8', '#d4607a']
  },
  default: {
    dark: ['#e0e0e0', '#9e9e9e', '#7db8e0', '#4a7fa5', '#6b7f8f', '#b5dce8'],
    light: ['#b0b0b0', '#6b6b6b', '#4a90c4', '#2f6690', '#53697a', '#7fc4d8']
  },
  ember: {
    dark: ['#c0392b', '#f5d76e', '#d8c3a5', '#e07b39', '#a8a847', '#8c6b52'],
    light: ['#a52a1f', '#d4b63c', '#b39b7d', '#c2621f', '#86862f', '#6e5240']
  },
  jade: {
    dark: ['#34c775', '#f0c040', '#e88a3a', '#2aa89a', '#b5c040', '#e05c2a'],
    light: ['#1fa85c', '#d4a017', '#d06e1e', '#1a8f82', '#8f9a24', '#c04418']
  }
} as const;

type ChartPaletteName = keyof typeof CHART_PALETTE_THEMES;

/** Dropdown order, with `default` pinned first. `chart-palette.test.ts` pins both the leading entry and completeness. */
const CHART_PALETTE_NAMES = ['default', 'berry', 'jade', 'ember'] as const satisfies readonly ChartPaletteName[];

/**
 * Grey, deliberately outside every theme, for the folded tail — a bucket, not a group. An ungrouped
 * chart takes the chosen theme's first slot instead, so the palette control is never inert.
 */
const NEUTRAL_MARK = {
  dark: '#a3a3a3',
  light: '#525252'
} as const;

const OTHER_GROUP_KEY = '__other__';

/**
 * How many groups a colour-by dimension may draw before the rest fold into `OTHER_GROUP_KEY`. Three
 * rather than the whole run: a scatter puts every pair of groups on screen at once, and only the
 * leading trio holds a colourblind-safe separation as an all-pairs set.
 */
const MAX_CATEGORICAL_GROUPS = 3;

/** The colour of a grouping's nth slot, or the neutral mark once the caller should have folded. */
function getCategoricalColor(index: number, theme: 'dark' | 'light', palette: ChartPaletteName): string {
  if (index >= MAX_CATEGORICAL_GROUPS) {
    return NEUTRAL_MARK[theme];
  }
  return CHART_PALETTE_THEMES[palette][theme][index] ?? NEUTRAL_MARK[theme];
}

/**
 * The colour of the nth measure in a selection, cycling once the theme runs out. Cycling is honest
 * here in a way it would not be for a grouping, because every line carries its own name in the
 * legend — whereas a repeated hue across two unlabelled groups is simply wrong.
 */
function getMeasureColor(index: number, theme: 'dark' | 'light', palette: ChartPaletteName): string {
  const colors = CHART_PALETTE_THEMES[palette][theme];
  return colors[index % colors.length]!;
}

/** The theme's colours in slot order, for rendering a swatch of what a palette looks like. */
function getPaletteSwatch(palette: ChartPaletteName, theme: 'dark' | 'light'): readonly string[] {
  return CHART_PALETTE_THEMES[palette][theme];
}

export {
  CHART_PALETTE_NAMES,
  CHART_PALETTE_THEMES,
  getCategoricalColor,
  getMeasureColor,
  getPaletteSwatch,
  MAX_CATEGORICAL_GROUPS,
  NEUTRAL_MARK,
  OTHER_GROUP_KEY
};
export type { ChartPaletteName };
