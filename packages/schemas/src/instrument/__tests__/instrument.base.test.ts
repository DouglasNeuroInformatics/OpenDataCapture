import { expect, test } from 'vitest';

import { $InstrumentKind, $InstrumentLanguage } from '../instrument.base.js';

test('$InstrumentKind', () => {
  expect($InstrumentKind.safeParse('FORM').success).toBe(true);
  expect($InstrumentKind.safeParse('INTERACTIVE').success).toBe(true);
  expect($InstrumentKind.safeParse('UNKNOWN').success).toBe(true);
});

test('$InstrumentLanguage', () => {
  expect($InstrumentLanguage.safeParse('en').success).toBe(true);
  expect($InstrumentLanguage.safeParse('fr').success).toBe(true);
  expect($InstrumentLanguage.safeParse([]).success).toBe(false);
  expect($InstrumentLanguage.safeParse(['en']).success).toBe(true);
  expect($InstrumentLanguage.safeParse(['fr']).success).toBe(true);
  expect($InstrumentLanguage.safeParse(['en', 'fr']).success).toBe(true);
  expect($InstrumentLanguage.safeParse(['en', 'fr', 'en']).success).toBe(false);
});
