type Mode = 'dark' | 'light';

/** Grey, for a subject whose sex was never recorded */
const NEUTRAL_MARK = {
  dark: '#a3a3a3',
  light: '#525252'
} as const;

/**
 * Baby pink for female, baby blue for male.
 *
 * One value serves both modes, because a pastel reads well against the dark surface as-is. Against
 * the light surface both sit near 1.6:1, far under the 3:1 a mark would normally need — which is why
 * `ColorTagCell` rings the dot, and why the label is always beside it rather than the colour
 * carrying the value.
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

export { getSexColor };
