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
});

describe('$FormInstrumentBlock', () => {
  it('should parse a block with a render function', () => {
    expect($FormInstrumentBlock.safeParse({ kind: 'block', render: () => null }).success).toBe(true);
  });
  it('should reject a block whose render is not a function', () => {
    expect($FormInstrumentBlock.safeParse({ kind: 'block', render: 'nope' }).success).toBe(false);
  });
});
