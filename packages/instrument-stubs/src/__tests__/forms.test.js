import { describe, expect, it } from 'vitest';

import { bilingualFormInstrument, unilingualFormInstrument } from '../forms.js';

describe.each([
  ['unilingualFormInstrument', unilingualFormInstrument],
  ['bilingualFormInstrument', bilingualFormInstrument]
])('%s', (_, stub) => {
  const { reasonFavoriteNumberIsNegative } = stub.instance.content;

  it('should be a form instrument', () => {
    expect(stub.instance.kind).toBe('FORM');
  });

  it('should hide the reason field before any data is entered', () => {
    expect(reasonFavoriteNumberIsNegative.render(undefined)).toBeNull();
  });

  it('should hide the reason field when the favorite number is zero', () => {
    expect(reasonFavoriteNumberIsNegative.render({ favoriteNumber: 0 })).toBeNull();
  });

  it('should hide the reason field when the favorite number is positive', () => {
    expect(reasonFavoriteNumberIsNegative.render({ favoriteNumber: 7 })).toBeNull();
  });

  it('should ask for a reason in a textarea when the favorite number is negative', () => {
    expect(reasonFavoriteNumberIsNegative.render({ favoriteNumber: -7 })).toMatchObject({
      kind: 'string',
      variant: 'textarea'
    });
  });
});

describe('unilingualFormInstrument', () => {
  const { content, measures } = unilingualFormInstrument.instance;

  it('should label the reason field in English only', () => {
    expect(content.reasonFavoriteNumberIsNegative.render({ favoriteNumber: -1 })?.label).toBe(
      'Why is Your Favorite Number Negative?'
    );
  });

  it('should measure a negative favorite number as negative', () => {
    expect(measures.hasNegativeFavoriteNumber.value({ favoriteNumber: -1 })).toBe(true);
  });

  it('should not measure a non-negative favorite number as negative', () => {
    expect(measures.hasNegativeFavoriteNumber.value({ favoriteNumber: 0 })).toBe(false);
  });
});

describe('bilingualFormInstrument', () => {
  const { validationSchema } = bilingualFormInstrument.instance;

  it('should accept data with a numeric favorite number and a reason', () => {
    expect(validationSchema.safeParse({ favoriteNumber: -1, reasonFavoriteNumberIsNegative: 'why not' }).success).toBe(
      true
    );
  });

  it('should reject a favorite number that is not a number', () => {
    expect(validationSchema.safeParse({ favoriteNumber: '1' }).success).toBe(false);
  });

  it('should label the reason field in both English and French', () => {
    expect(
      bilingualFormInstrument.instance.content.reasonFavoriteNumberIsNegative.render({ favoriteNumber: -1 })?.label
    ).toEqual({
      en: 'Why is Your Favorite Number Negative?',
      fr: 'Pourquoi votre nombre préféré est-il négatif ?'
    });
  });
});
