import { describe, expect, it } from 'vitest';

import { BILINGUAL_FORM_INSTRUMENT, UNILINGUAL_FORM_INSTRUMENT } from '../__stubs__/form-instrument.stubs.js';
import { $FormInstrument } from '../instrument.form.js';

describe('$FormInstrument', () => {
  it('should successfully parse valid instruments', () => {
    expect($FormInstrument.safeParse(UNILINGUAL_FORM_INSTRUMENT).success).toBe(true);
    expect($FormInstrument.safeParse(BILINGUAL_FORM_INSTRUMENT).success).toBe(true);
  });
  it('should fail to validate an instrument where the title is null', () => {
    expect(
      $FormInstrument.safeParse({
        ...UNILINGUAL_FORM_INSTRUMENT,
        details: { ...UNILINGUAL_FORM_INSTRUMENT.details, title: null }
      }).success
    ).toBe(false);
    expect(
      $FormInstrument.safeParse({
        ...BILINGUAL_FORM_INSTRUMENT,
        details: { ...BILINGUAL_FORM_INSTRUMENT.details, title: null }
      }).success
    ).toBe(false);
  });
});
