import { getCategoricalColor, NEUTRAL_MARK } from '@/utils/chart-palette';

type Mode = 'dark' | 'light';

/**
 * Colours for the nominal values tagged in tables.
 *
 * Values come from the validated categorical palette rather than new hex, so the app holds one set
 * of nominal colours instead of a second ad-hoc one that drifts. Each is paired with its label
 * wherever it is rendered, so the colour is redundant rather than load-bearing — which is what makes
 * it safe for a colourblind reader, and why a theme's slot separation is not a constraint here.
 */

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

/** One slot per instrument kind, in the order a reader is most likely to meet them. */
function getInstrumentKindColor(kind: string, mode: Mode): string {
  const slots: { [key: string]: number } = { FILE: 2, FORM: 0, INTERACTIVE: 1 };
  const slot = slots[kind];
  return slot === undefined ? NEUTRAL_MARK[mode] : getCategoricalColor(slot, mode, 'default');
}

export { getInstrumentKindColor, getSexColor };
