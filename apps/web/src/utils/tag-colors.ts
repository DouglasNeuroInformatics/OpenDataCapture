import type { InstrumentKind } from '@opendatacapture/runtime-core';

type Mode = 'dark' | 'light';

/**
 * Baby pink for female, baby blue for male, grey for a subject whose sex was never recorded.
 *
 * Asked for by name, so these sit outside the validated categorical palette, and one value serves
 * both modes because a pastel reads well against the dark surface as-is. Against the light surface
 * both are near 1.6:1, far under the 3:1 a mark would normally need — which is why `ColorTagCell`
 * rings the dot, and why the label is always beside it rather than the colour carrying the value.
 */
const SEX_COLORS = {
  FEMALE: '#f9a8d4',
  MALE: '#89cff0'
} as const;

/**
 * One named colour per instrument kind, held here rather than taken from the chart palette: the
 * palette is a per-user chart setting, and choosing one must not recolour a table's kind column.
 */
const INSTRUMENT_KIND_COLORS = {
  FILE: { dark: '#22c55e', light: '#16a34a' },
  FORM: { dark: '#3b82f6', light: '#2563eb' },
  INTERACTIVE: { dark: '#ef4444', light: '#dc2626' },
  SERIES: { dark: '#eab308', light: '#ca8a04' }
} as const satisfies { [K in InstrumentKind]: { dark: string; light: string } };

const NEUTRAL_COLOR = {
  dark: '#a3a3a3',
  light: '#525252'
} as const;

function getSexColor(sex: null | string, mode: Mode): string {
  if (sex === 'FEMALE' || sex === 'MALE') {
    return SEX_COLORS[sex];
  }
  return NEUTRAL_COLOR[mode];
}

function getInstrumentKindColor(kind: InstrumentKind, mode: Mode): string {
  return INSTRUMENT_KIND_COLORS[kind][mode];
}

export { getInstrumentKindColor, getSexColor };
