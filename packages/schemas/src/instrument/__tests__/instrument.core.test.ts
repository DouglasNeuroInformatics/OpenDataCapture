import { describe, expect, it } from 'vitest';

import { BILINGUAL_FORM_INSTRUMENT, UNILINGUAL_FORM_INSTRUMENT } from '../__stubs__/form-instrument.stubs.js';
import { INTERACTIVE_INSTRUMENT } from '../__stubs__/interactive-instrument.stubs.js';
import { $AnyInstrument } from '../instrument.core.js';

describe('$AnyInstrument', () => {
  it('should parse a multilingual form instrument', () => {
    expect($AnyInstrument.safeParse(BILINGUAL_FORM_INSTRUMENT).success).toBe(true);
  });
  it('should parse a unilingual form instrument', () => {
    expect($AnyInstrument.safeParse(UNILINGUAL_FORM_INSTRUMENT).success).toBe(true);
  });
  it('should parse a interactive instrument', () => {
    expect($AnyInstrument.safeParse(INTERACTIVE_INSTRUMENT).success).toBe(true);
  });
});
