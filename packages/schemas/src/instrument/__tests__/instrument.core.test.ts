import { BILINGUAL_FORM_INSTRUMENT, UNILINGUAL_FORM_INSTRUMENT } from '@opendatacapture/instrument-stubs/forms';
import { INTERACTIVE_INSTRUMENT } from '@opendatacapture/instrument-stubs/interactive';
import { describe, expect, it } from 'vitest';

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
