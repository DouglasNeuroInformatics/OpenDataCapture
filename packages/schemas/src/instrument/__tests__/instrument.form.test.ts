import { bilingualFormInstrument, unilingualFormInstrument } from '@opendatacapture/instrument-stubs/forms';
import { describe, expect, it } from 'vitest';
import { z } from 'zod/v4';

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

  describe('fields that libui-form-types added after the schema was written', () => {
    const parseWithField = (field: { [key: string]: unknown }) => {
      return $$FormInstrument().safeParse({
        ...unilingualFormInstrument.instance,
        content: [{ fields: { answer: { label: 'Answer', ...field } } }]
      });
    };

    // Stripped for the same reason as resetButton above, the field would render as a date-only picker
    // in the playground and as a date-time picker in production.
    it.each(['date', 'datetime'])('should preserve a date field variant of %s rather than stripping it', (variant) => {
      const result = parseWithField({ kind: 'date', variant });
      expect(result.success).toBe(true);
      expect(result.data?.content).toMatchObject([{ fields: { answer: { variant } } }]);
    });

    it('should parse a date field that omits variant, since it is optional', () => {
      expect(parseWithField({ kind: 'date' }).success).toBe(true);
    });

    it('should reject a date field variant that is neither date nor datetime', () => {
      expect(parseWithField({ kind: 'date', variant: 'time' }).success).toBe(false);
    });

    const setField = { kind: 'set', options: { none: 'None', some: 'Some' }, variant: 'listbox' };

    it('should preserve the exclusive options of a set field rather than stripping them', () => {
      const result = parseWithField({ ...setField, exclusiveOptions: ['none'] });
      expect(result.success).toBe(true);
      expect(result.data?.content).toMatchObject([{ fields: { answer: { exclusiveOptions: ['none'] } } }]);
    });

    it('should parse a set field that omits exclusiveOptions, since it is optional', () => {
      expect(parseWithField(setField).success).toBe(true);
    });

    it('should reject exclusive options that are not a list of option keys', () => {
      expect(parseWithField({ ...setField, exclusiveOptions: 'none' }).success).toBe(false);
    });
  });

  describe('number-record options', () => {
    const parseWithOptions = (options: { [key: string]: string }) => {
      return $$FormInstrument().safeParse({
        ...unilingualFormInstrument.instance,
        content: [
          {
            fields: {
              mood: {
                items: { sleep: { label: 'Sleep' } },
                kind: 'number-record',
                label: 'Mood',
                options,
                variant: 'likert'
              }
            }
          }
        ]
      });
    };

    it.each(['1', '0', '-1', '2.5'])('should accept %s as a scale value, since object keys are strings', (key) => {
      expect(parseWithOptions({ [key]: 'Label' }).success).toBe(true);
    });

    it.each(['', ' ', 'one', '1a', '1e3', '0x1', 'Infinity', 'NaN'])(
      'should reject %j as a scale value, rather than read it as a number',
      (key) => {
        expect(parseWithOptions({ [key]: 'Label' }).success).toBe(false);
      }
    );

    it('should keep the options addressable by their numeric value', () => {
      const result = parseWithOptions({ '1': 'Never', '2': 'Always' });
      expect(result.data?.content).toMatchObject([{ fields: { mood: { options: { 1: 'Never', 2: 'Always' } } } }]);
    });

    it('should convert to a JSON Schema, which apps/outreach publishes, naming the keys as strings', () => {
      const schema = JSON.stringify(z.toJSONSchema($$FormInstrument('en')));
      expect(schema).toContain('"propertyNames":{"type":"string","pattern"');
    });
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
