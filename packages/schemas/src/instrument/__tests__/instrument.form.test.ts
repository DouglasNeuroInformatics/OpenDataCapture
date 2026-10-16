import { bilingualFormInstrument, unilingualFormInstrument } from '@opendatacapture/instrument-stubs/forms';
import { describe, expect, it } from 'vitest';

import { $$FormInstrument, $FormInstrumentBlock } from '../instrument.form.js';

describe('$$FormInstrument', () => {
  it('should successfully parse valid instruments', () => {
    expect($$FormInstrument().safeParse(unilingualFormInstrument.instance).success).toBe(true);
    expect($$FormInstrument().safeParse(bilingualFormInstrument.instance).success).toBe(true);
  });
  it('should fail to validate an instrument where the title is null', () => {
    expect(
      $$FormInstrument().safeParse({
        ...unilingualFormInstrument.instance,
        details: { ...unilingualFormInstrument.instance.details, title: null }
      }).success
    ).toBe(false);
    expect(
      $$FormInstrument().safeParse({
        ...bilingualFormInstrument.instance,
        details: { ...bilingualFormInstrument.instance.details, title: null }
      }).success
    ).toBe(false);
  });
  it('should parse a form whose content inlines a block amongst groups', () => {
    const result = $$FormInstrument().safeParse({
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
    const result = $$FormInstrument().safeParse({ ...unilingualFormInstrument.instance, resetButton: true });
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('resetButton', true);
  });

  it('should parse a form that omits resetButton, since it is optional', () => {
    const result = $$FormInstrument().safeParse(unilingualFormInstrument.instance);
    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty('resetButton');
  });

  it('should reject a non-boolean resetButton', () => {
    expect($$FormInstrument().safeParse({ ...unilingualFormInstrument.instance, resetButton: 'yes' }).success).toBe(
      false
    );
  });

  // Stripped for the same reason as resetButton above, the summary would fall back to the instrument's
  // default visibility and show a measure its author hid, or hide one they marked visible.
  it.each(['hidden', 'visible'])(
    'should preserve a computed measure marked %s rather than stripping it',
    (visibility) => {
      const { measures } = unilingualFormInstrument.instance;
      const result = $$FormInstrument().safeParse({
        ...unilingualFormInstrument.instance,
        measures: { hasNegativeFavoriteNumber: { ...measures?.hasNegativeFavoriteNumber, visibility } }
      });
      expect(result.success).toBe(true);
      expect(result.data?.measures?.hasNegativeFavoriteNumber?.visibility).toBe(visibility);
    }
  );

  it('should preserve the visibility of a constant measure rather than stripping it', () => {
    const { measures } = unilingualFormInstrument.instance;
    const result = $$FormInstrument().safeParse({
      ...unilingualFormInstrument.instance,
      measures: { favoriteNumber: { ...measures?.favoriteNumber, visibility: 'hidden' } }
    });
    expect(result.success).toBe(true);
    expect(result.data?.measures?.favoriteNumber?.visibility).toBe('hidden');
  });

  it('should reject a computed measure whose visibility is neither hidden nor visible, rather than stripping it', () => {
    const { measures } = unilingualFormInstrument.instance;
    const result = $$FormInstrument().safeParse({
      ...unilingualFormInstrument.instance,
      measures: { hasNegativeFavoriteNumber: { ...measures?.hasNegativeFavoriteNumber, visibility: 'secret' } }
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues).toMatchObject([{ path: ['measures', 'hasNegativeFavoriteNumber', 'visibility'] }]);
  });

  it("should leave visibility unset on a computed measure that omits it, so the instrument's default decides", () => {
    const result = $$FormInstrument().safeParse(unilingualFormInstrument.instance);
    const measure = result.data?.measures?.hasNegativeFavoriteNumber;
    expect(measure).toMatchObject({ kind: 'computed' });
    expect(measure?.visibility).toBeUndefined();
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
