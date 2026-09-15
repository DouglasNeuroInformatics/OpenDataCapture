import { bilingualFormInstrument, unilingualFormInstrument } from '@opendatacapture/instrument-stubs/forms';
import { describe, expect, it } from 'vitest';

import { $FormInstrument, $FormInstrumentBlock } from '../instrument.form.js';

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
  it('should parse a form whose content inlines a block amongst groups', () => {
    const result = $FormInstrument.safeParse({
      ...unilingualFormInstrument.instance,
      content: [
        { kind: 'block', render: () => null },
        { fields: { favoriteNumber: { kind: 'number', label: 'Favorite Number', variant: 'input' } } }
      ]
    });
    expect(result.success).toBe(true);
  });

  // Zod strips what it does not declare, and `apps/web` only validates in development while the
  // playground always does — so omitting `resetButton` here would drop the flag in exactly the places
  // an author tests their instrument, while leaving it intact in production.
  it('should preserve resetButton rather than stripping it', () => {
    const result = $FormInstrument.safeParse({ ...unilingualFormInstrument.instance, resetButton: true });
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('resetButton', true);
  });

  it('should parse a form that omits resetButton, since it is optional', () => {
    const result = $FormInstrument.safeParse(unilingualFormInstrument.instance);
    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty('resetButton');
  });

  it('should reject a non-boolean resetButton', () => {
    expect($FormInstrument.safeParse({ ...unilingualFormInstrument.instance, resetButton: 'yes' }).success).toBe(false);
  });
});

describe('$FormInstrumentBlock', () => {
  it('should parse a block with a render function', () => {
    expect($FormInstrumentBlock.safeParse({ kind: 'block', render: () => null }).success).toBe(true);
  });
  it('should reject a block whose render is not a function', () => {
    expect($FormInstrumentBlock.safeParse({ kind: 'block', render: 'nope' }).success).toBe(false);
  });
});
