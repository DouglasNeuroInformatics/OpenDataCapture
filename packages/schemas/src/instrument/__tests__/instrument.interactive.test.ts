import { interactiveInstrument } from '@opendatacapture/instrument-stubs/interactive';
import { describe, expect, it } from 'vitest';

import { $InteractiveInstrument } from '../instrument.interactive.js';

describe('$InteractiveInstrument', () => {
  it('should successfully parse valid instruments', () => {
    expect($InteractiveInstrument.safeParse(interactiveInstrument.instance).success).toBe(true);
  });
});
