import type React from 'react';

import type { Theme } from '@douglasneuroinformatics/libui/hooks';

/** The recessive grey the grid, axis lines and ticks share */
const AXIS_STROKE = '#64748b';

/** Axis and legend text. Never a series colour — identity comes from the mark beside the text. */
const inkColors: { [K in Theme]: string } = {
  dark: '#cbd5e1',
  light: '#475569'
};

const tooltipStyles: { [K in Theme]: React.CSSProperties } = {
  dark: {
    backgroundColor: '#0f172a',
    borderColor: inkColors.light,
    borderRadius: '2px'
  },
  light: {
    backgroundColor: '#f1f5f9',
    borderColor: inkColors.dark,
    borderRadius: '2px'
  }
};

/**
 * Axis bands sized to clear their own tick text before the axis title sits below it.
 *
 * The x band has to hold a tick row (`tickSize` + `tickMargin` + a line of text, about 28px) and
 * then the title underneath with daylight between them, which is why it is a good deal taller than
 * recharts' default. The y band is widened for the same reason on its own axis.
 */
const X_AXIS_HEIGHT = 72;

/** Lifts the title off the very bottom edge of the band without closing the gap to the ticks */
const X_AXIS_LABEL_OFFSET = 6;

const Y_AXIS_WIDTH = 64;

/** `useTheme` is typed more loosely than the two modes these maps are keyed on. */
function resolveTheme(theme: string | undefined): Theme {
  return theme === 'dark' ? 'dark' : 'light';
}

export { AXIS_STROKE, inkColors, resolveTheme, tooltipStyles, X_AXIS_HEIGHT, X_AXIS_LABEL_OFFSET, Y_AXIS_WIDTH };
