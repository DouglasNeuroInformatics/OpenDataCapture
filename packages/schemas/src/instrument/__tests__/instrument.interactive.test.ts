import { describe, expect, it } from 'vitest';

import { INTERACTIVE_INSTRUMENT } from '../__stubs__/interactive-instrument.stubs.js';
import { $InteractiveInstrument } from '../instrument.interactive.js';

describe('$InteractiveInstrument', () => {
  it('should successfully parse valid instruments', () => {
    expect($InteractiveInstrument.safeParse(INTERACTIVE_INSTRUMENT).success).toBe(true);
  });

  it('should reject an instrument with a multilingual title', () => {
    expect(
      $InteractiveInstrument.safeParse({
        ...INTERACTIVE_INSTRUMENT,
        details: {
          ...INTERACTIVE_INSTRUMENT.details,
          title: {
            en: 'My Title',
            fr: 'Mon titre'
          }
        }
      }).success
    ).toBe(false);
  });
});
