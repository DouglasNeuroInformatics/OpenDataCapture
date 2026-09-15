import type { AnyUnilingualScalarInstrument } from '@opendatacapture/runtime-core';
import { describe, expect, it } from 'vitest';
import { z } from 'zod/v4';

import { validateSubmission } from '../validateSubmission';

const instrument = {
  validationSchema: z.object({ answer: z.string().min(1) })
} as unknown as AnyUnilingualScalarInstrument;

describe('validateSubmission', () => {
  it('should succeed when the serialized data parses against the validation schema', () => {
    expect(validateSubmission(instrument, { answer: 'hello' })).toEqual({ success: true });
  });

  it('should report issues when the serialized data fails the validation schema', () => {
    const result = validateSubmission(instrument, { answer: '' });
    expect(result.success).toBe(false);
    expect((result as { issues: unknown }).issues).toBeTruthy();
  });

  it('should reconstruct serialized types through the reviver before validating', () => {
    const dateInstrument = {
      validationSchema: z.object({ when: z.date() })
    } as unknown as AnyUnilingualScalarInstrument;
    const result = validateSubmission(dateInstrument, {
      when: { __deserializedType: 'Date', __isSerializedType: true, value: '2024-01-01T00:00:00.000Z' }
    });
    expect(result.success).toBe(true);
  });
});
