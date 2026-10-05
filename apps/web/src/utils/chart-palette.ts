/**
 * The categorical palettes for charts that colour marks by a grouping dimension.
 *
 * Three slots per theme, not more: a scatter puts every pair of series on screen at once, and only
 * a three-colour set clears the colourblind and normal-vision separation floors against both
 * surfaces as an all-pairs set. A grouping with more values folds its tail into `OTHER_GROUP_KEY`
 * rather than growing the palette. Each theme's dark column is the same three hues re-stepped for
 * the dark surface, not an automatic inversion of the light one.
 *
 * Every theme was verified with the data-visualization skill's palette validator at `--pairs all`
 * in both modes, and all three clear the 6–8 CVD band outright rather than relying on secondary
 * encoding — worst-pair CVD ΔE: default 9.2 light / 9.4 dark, berry 13.0 / 13.0, jade 9.2 / 9.4.
 *
 * Slot order matters as well as membership: slot one is what an ungrouped chart draws with and what
 * the first group takes, so each theme leads with the hue it is named for. `jade` therefore carries
 * the same three hues as the set it replaced, led by the green-teal instead of the orange — it is
 * the only green-led trio that passes, since jade with magenta and yellow collapses to ΔE 1.6 in
 * dark and green with blue and orange fails outright in both modes.
 *
 * The hues of a theme are deliberately spread around the wheel. Sets drawn from one side of it —
 * an all-warm orange/red/yellow, or a blue/violet/aqua — were tried and rejected: they fail the
 * separation floors outright (orange↔red ΔE 5.6, blue↔violet 1.9 in dark), because small hue gaps
 * cannot survive a colourblind transform. A single-hue ramp is likewise absent: it fails the
 * ordinal light-end contrast check, and a nominal grouping is not a magnitude to shade anyway.
 *
 * Several light-mode slots sit below 3:1 against the light surface, which obliges the relief the
 * charts already carry: a legend, and the sibling table showing the same records.
 */
const CHART_PALETTE_THEMES = {
  berry: {
    dark: ['#d55181', '#008300', '#3987e5'],
    light: ['#e87ba4', '#008300', '#2a78d6']
  },
  default: {
    dark: ['#3987e5', '#d95926', '#199e70'],
    light: ['#2a78d6', '#eb6834', '#1baf7a']
  },
  jade: {
    dark: ['#199e70', '#9085e9', '#d95926'],
    light: ['#1baf7a', '#4a3aa7', '#eb6834']
  }
} as const;

type ChartPaletteName = keyof typeof CHART_PALETTE_THEMES;

/**
 * Dropdown order, with `default` pinned first. Written out rather than derived from the themes
 * object, whose key order is alphabetical because eslint sorts object literals — which would bury
 * the default in the middle. `chart-palette.test.ts` pins both the leading entry and completeness.
 */
const CHART_PALETTE_NAMES = ['default', 'berry', 'jade'] as const satisfies readonly ChartPaletteName[];

/**
 * Grey, deliberately outside every theme, for the folded tail — a bucket, not a group. An ungrouped
 * chart takes the chosen theme's first slot instead, so the palette control is never inert.
 */
const NEUTRAL_MARK = {
  dark: '#a3a3a3',
  light: '#525252'
} as const;

const OTHER_GROUP_KEY = '__other__';

const MAX_CATEGORICAL_GROUPS = CHART_PALETTE_THEMES.default.light.length;

function getCategoricalColor(index: number, theme: 'dark' | 'light', palette: ChartPaletteName): string {
  return CHART_PALETTE_THEMES[palette][theme][index] ?? NEUTRAL_MARK[theme];
}

/** The theme's colours in slot order, for rendering a swatch of what a palette looks like. */
function getPaletteSwatch(palette: ChartPaletteName, theme: 'dark' | 'light'): readonly string[] {
  return CHART_PALETTE_THEMES[palette][theme];
}

export {
  CHART_PALETTE_NAMES,
  CHART_PALETTE_THEMES,
  getCategoricalColor,
  getPaletteSwatch,
  MAX_CATEGORICAL_GROUPS,
  NEUTRAL_MARK,
  OTHER_GROUP_KEY
};
export type { ChartPaletteName };
