import type React from 'react';

import type { Language } from '@opendatacapture/schemas/core';
import type { DarkCardTheme, LightCardTheme, SetupState } from '@opendatacapture/schemas/setup';

type CardMode = 'dark' | 'light';

type CardShade = { border: string; fill: string };

type CardShades<TTheme extends string> = { [T in TTheme]: CardShade };

type InstanceCardStyle = React.CSSProperties & {
  [TVariable in `--instance-card-${keyof CardShade}-${CardMode}`]: string;
};

/**
 * Neutrals plus two cool tints, chosen to sit with the app's slate palette. Each mode has its own list,
 * and all keep body and muted text above WCAG AAA contrast in their mode.
 */
const LIGHT_CARD_SHADES: CardShades<Exclude<LightCardTheme, 'custom'>> = {
  fog: { border: '#CDD5DF', fill: '#E6EBF1' },
  heather: { border: '#C9BFDD', fill: '#E4DEF0' },
  invisible: { border: 'transparent', fill: 'transparent' },
  ivory: { border: '#E4DCC8', fill: '#F8F3E6' },
  mist: { border: '#B5CCE2', fill: '#D7E5F2' },
  paper: { border: '#E2E8F0', fill: '#FFFFFF' },
  silver: { border: '#B8C2CE', fill: '#D5DCE5' }
};

const DARK_CARD_SHADES: CardShades<Exclude<DarkCardTheme, 'custom'>> = {
  charcoal: { border: '#3F4247', fill: '#27292D' },
  graphite: { border: '#2E3035', fill: '#17181B' },
  heather: { border: '#463463', fill: '#261B3C' },
  invisible: { border: 'transparent', fill: 'transparent' },
  midnight: { border: '#1E2430', fill: '#030509' },
  mist: { border: '#23486E', fill: '#10253D' },
  steel: { border: '#364459', fill: '#1E293B' }
};

const DEFAULT_CUSTOM_CARD_COLOR: { [TMode in CardMode]: string } = {
  dark: DARK_CARD_SHADES.mist.fill,
  light: LIGHT_CARD_SHADES.mist.fill
};

const getCustomCardShade = (mode: CardMode, customColor?: null | string): CardShade => {
  const fill = customColor ?? DEFAULT_CUSTOM_CARD_COLOR[mode];
  return { border: `color-mix(in oklab, ${fill} 88%, ${mode === 'dark' ? 'white' : 'black'})`, fill };
};

const getLightCardShades = (customColor?: null | string): CardShades<LightCardTheme> => ({
  ...LIGHT_CARD_SHADES,
  custom: getCustomCardShade('light', customColor)
});

const getDarkCardShades = (customColor?: null | string): CardShades<DarkCardTheme> => ({
  ...DARK_CARD_SHADES,
  custom: getCustomCardShade('dark', customColor)
});

/** Pair with `INSTANCE_CARD_VARIABLES`, which picks between the two modes this sets. */
const getInstanceCardStyle = (
  state: Pick<SetupState, 'customCardColorDark' | 'customCardColorLight' | 'darkCardTheme' | 'lightCardTheme'>
): InstanceCardStyle => {
  const dark = getDarkCardShades(state.customCardColorDark)[state.darkCardTheme];
  const light = getLightCardShades(state.customCardColorLight)[state.lightCardTheme];
  return {
    '--instance-card-border-dark': dark.border,
    '--instance-card-border-light': light.border,
    '--instance-card-fill-dark': dark.fill,
    '--instance-card-fill-light': light.fill
  };
};

/** Written as one literal because Tailwind finds classes by scanning this file's text. */
const INSTANCE_CARD_VARIABLES =
  '[--instance-card-border:var(--instance-card-border-light)] [--instance-card-fill:var(--instance-card-fill-light)] dark:[--instance-card-border:var(--instance-card-border-dark)] dark:[--instance-card-fill:var(--instance-card-fill-dark)]';

const CARD_THEME_LABELS: { [TTheme in DarkCardTheme | LightCardTheme]: { [L in Language]: string } } = {
  charcoal: { en: 'Charcoal', es: 'Carbón', fr: 'Charbon' },
  custom: { en: 'Custom', es: 'Personalizado', fr: 'Personnalisé' },
  fog: { en: 'Fog', es: 'Niebla', fr: 'Brouillard' },
  graphite: { en: 'Graphite', es: 'Grafito', fr: 'Graphite' },
  heather: { en: 'Heather', es: 'Brezo', fr: 'Bruyère' },
  invisible: { en: 'No Color', es: 'Sin color', fr: 'Sans couleur' },
  ivory: { en: 'Ivory', es: 'Marfil', fr: 'Ivoire' },
  midnight: { en: 'Midnight', es: 'Medianoche', fr: 'Minuit' },
  mist: { en: 'Mist', es: 'Neblina', fr: 'Brume' },
  paper: { en: 'Paper', es: 'Papel', fr: 'Papier' },
  silver: { en: 'Silver', es: 'Plata', fr: 'Argent' },
  steel: { en: 'Steel', es: 'Acero', fr: 'Acier' }
};

/**
 * The surface of a card painted in the instance's color. Falls back to transparent so a card outside
 * the layout that sets the variables, such as in a dialog's portal, draws nothing.
 */
const INSTANCE_CARD_SURFACE =
  'border border-[color:var(--instance-card-border,transparent)] bg-[color:var(--instance-card-fill,transparent)] shadow-none';

/** A page's submit button, which at libui's full width reads as a bar once the card around it is invisible. */
const PAGE_SUBMIT_BUTTON = 'ml-auto w-auto min-w-32';

export {
  CARD_THEME_LABELS,
  DEFAULT_CUSTOM_CARD_COLOR,
  getDarkCardShades,
  getInstanceCardStyle,
  getLightCardShades,
  INSTANCE_CARD_SURFACE,
  INSTANCE_CARD_VARIABLES,
  PAGE_SUBMIT_BUTTON
};
export type { CardMode, CardShades };
