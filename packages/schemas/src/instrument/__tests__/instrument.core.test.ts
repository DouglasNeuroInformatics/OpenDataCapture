import { bilingualFormInstrument, unilingualFormInstrument } from '@opendatacapture/instrument-stubs/forms';
import { interactiveInstrument } from '@opendatacapture/instrument-stubs/interactive';
import { describe, expect, it } from 'vitest';

import { $AnyScalarInstrument } from '../instrument.core.js';

describe('$AnyScalarInstrument', () => {
  it('should parse a multilingual form instrument', () => {
    expect($AnyScalarInstrument.safeParse(bilingualFormInstrument.instance).success).toBe(true);
  });
  it('should parse a unilingual form instrument', () => {
    expect($AnyScalarInstrument.safeParse(unilingualFormInstrument.instance).success).toBe(true);
  });
  it('should parse a interactive instrument', () => {
    expect($AnyScalarInstrument.safeParse(interactiveInstrument.instance).success).toBe(true);
  });
});
