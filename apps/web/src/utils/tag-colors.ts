import type { InstrumentKind } from '@opendatacapture/runtime-core';

import { getCategoricalColor, NEUTRAL_MARK } from '@/utils/chart-palette';

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

function getSexColor(sex: null | string, mode: Mode): string {
  if (sex === 'FEMALE' || sex === 'MALE') {
    return SEX_COLORS[sex];
  }
  return NEUTRAL_MARK[mode];
}

/**
 * One palette slot per instrument kind.
 *
 * A series is the neutral mark rather than a fourth hue: the palette holds three validated slots,
 * and a generated fourth is never the answer.
 */
function getInstrumentKindColor(kind: InstrumentKind, mode: Mode): string {
  const slots: { [K in InstrumentKind]: null | number } = { FILE: 2, FORM: 0, INTERACTIVE: 1, SERIES: null };
  const slot = slots[kind];
  return slot === null ? NEUTRAL_MARK[mode] : getCategoricalColor(slot, mode, 'default');
}

export { getInstrumentKindColor, getSexColor };
