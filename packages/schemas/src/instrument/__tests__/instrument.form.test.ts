import { bilingualFormInstrument, unilingualFormInstrument } from '@opendatacapture/instrument-stubs/forms';
import { describe, expect, it } from 'vitest';

import { $FormInstrument } from '../instrument.form.js';

describe('$FormInstrument', () => {
  it('should successfully parse valid instruments', () => {
    expect($FormInstrument.safeParse(unilingualFormInstrument.instance).success).toBe(true);
    expect($FormInstrument.safeParse(bilingualFormInstrument.instance).success).toBe(true);
  });
  it('should fail to validate an instrument where the title is null', () => {
    expect(
      $FormInstrument.safeParse({
        ...unilingualFormInstrument.instance,
        details: { ...unilingualFormInstrument.instance.details, title: null }
      }).success
    ).toBe(false);
    expect(
      $FormInstrument.safeParse({
        ...bilingualFormInstrument.instance,
        details: { ...bilingualFormInstrument.instance.details, title: null }
      }).success
    ).toBe(false);
  });
});
