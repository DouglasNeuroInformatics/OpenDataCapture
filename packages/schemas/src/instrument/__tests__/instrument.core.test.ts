import { bilingualFormInstrument, unilingualFormInstrument } from '@opendatacapture/instrument-stubs/forms';
import { interactiveInstrument } from '@opendatacapture/instrument-stubs/interactive';
import { describe, expect, it } from 'vitest';

import { $AnyInstrument } from '../instrument.core.js';

describe('$AnyInstrument', () => {
  it('should parse a multilingual form instrument', () => {
    expect($AnyInstrument.safeParse(bilingualFormInstrument.instance).success).toBe(true);
  });
  it('should parse a unilingual form instrument', () => {
    expect($AnyInstrument.safeParse(unilingualFormInstrument.instance).success).toBe(true);
  });
  it('should parse a interactive instrument', () => {
    expect($AnyInstrument.safeParse(interactiveInstrument.instance).success).toBe(true);
  });
});
