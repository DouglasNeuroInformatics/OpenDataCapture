import type { AnyUnilingualScalarInstrument, FormInstrument, Language } from '@opendatacapture/runtime-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { computeInstrumentMeasures } from '../measures.js';

type TData = { favoriteNumber: number };

const formInstrument = {
  content: { favoriteNumber: { kind: 'number', label: 'Favorite Number', variant: 'input' } },
  internal: { edition: 1, name: 'STUB_FORM' },
  kind: 'FORM',
  language: 'en',
  measures: {
    favoriteNumber: { kind: 'const', ref: 'favoriteNumber' },
    isNegative: { kind: 'computed', label: 'Is Negative', value: (data: TData) => data.favoriteNumber < 0 }
  }
} as unknown as AnyUnilingualScalarInstrument & { content: FormInstrument.Content<TData, Language> };

type TDynamicData = { hasPet: boolean; petName?: string };

const dynamicFormInstrument = {
  content: {
    hasPet: { kind: 'boolean', label: 'Has Pet', variant: 'radio' },
    petName: {
      deps: ['hasPet'],
      kind: 'dynamic',
      render: (data: FormInstrument.PartialData<TDynamicData>) => {
        return data.hasPet ? { kind: 'string', label: 'Pet Name', variant: 'input' } : null;
      }
    }
  },
  internal: { edition: 1, name: 'STUB_DYNAMIC_FORM' },
  kind: 'FORM',
  language: 'en',
  measures: {
    labeledPetName: { kind: 'const', label: 'Name of Pet', ref: 'petName' },
    petName: { kind: 'const', ref: 'petName' }
  }
} as unknown as AnyUnilingualScalarInstrument;

const interactiveInstrument = {
  internal: { edition: 1, name: 'STUB_INTERACTIVE' },
  kind: 'INTERACTIVE',
  language: 'en',
  measures: { message: { kind: 'const', ref: 'message' } }
} as unknown as AnyUnilingualScalarInstrument;

describe('computeInstrumentMeasures', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return an empty object and log an error when data is not a plain object', () => {
    expect(computeInstrumentMeasures(formInstrument, 'not an object')).toEqual({});
    expect(console.error).toHaveBeenCalledOnce();
  });

  it("should compute a 'computed' measure by calling its value function with the data", () => {
    const result = computeInstrumentMeasures(formInstrument, { favoriteNumber: -3 });
    expect(result.isNegative).toEqual({ label: 'Is Negative', value: true });
  });

  it("should fall back to the form field's label for a 'const' measure with no explicit label", () => {
    const result = computeInstrumentMeasures(formInstrument, { favoriteNumber: 7 });
    expect(result.favoriteNumber).toEqual({ label: 'Favorite Number', value: 7 });
  });

  it("should read a 'const' measure's value and label through its ref, so a measure keyed apart from its field still shows that field", () => {
    const instrument = {
      ...formInstrument,
      measures: { favorite: { kind: 'const', ref: 'favoriteNumber' } }
    } as unknown as AnyUnilingualScalarInstrument;
    const result = computeInstrumentMeasures(instrument, { favoriteNumber: 7 });
    expect(result.favorite).toEqual({ label: 'Favorite Number', value: 7 });
  });

  it("should use a 'const' measure's own label when it declares one", () => {
    const instrument = {
      ...formInstrument,
      measures: { total: { kind: 'const', label: 'Total', ref: 'total' } }
    } as unknown as AnyUnilingualScalarInstrument;
    const result = computeInstrumentMeasures(instrument, { total: 42 });
    expect(result.total).toEqual({ label: 'Total', value: 42 });
  });

  it("should drop a 'const' measure whose data value fails validation, and log an error", () => {
    const instrument = {
      ...formInstrument,
      measures: { total: { kind: 'const', label: 'Total', ref: 'total' } }
    } as unknown as AnyUnilingualScalarInstrument;
    const result = computeInstrumentMeasures(instrument, { total: { nested: true } });
    expect(result.total).toBeUndefined();
    expect(console.error).toHaveBeenCalledOnce();
  });

  it("should drop a 'const' measure with no label on a non-form instrument, and log an error", () => {
    const result = computeInstrumentMeasures(interactiveInstrument, { message: 'hello' });
    expect(result.message).toBeUndefined();
    expect(console.error).toHaveBeenCalledOnce();
  });

  it('should leave out a labeled measure on a dynamic field its data keeps hidden, since the respondent never saw it', () => {
    const result = computeInstrumentMeasures(dynamicFormInstrument, { hasPet: false });
    expect(result.labeledPetName).toBeUndefined();
  });

  it('should keep a labeled measure on a dynamic field once its data reveals it', () => {
    const result = computeInstrumentMeasures(dynamicFormInstrument, { hasPet: true, petName: 'Rex' });
    expect(result.labeledPetName).toEqual({ label: 'Name of Pet', value: 'Rex' });
  });

  it('should leave out an unlabeled measure on a hidden dynamic field without logging, since nothing failed', () => {
    const result = computeInstrumentMeasures(dynamicFormInstrument, { hasPet: false });
    expect(result.petName).toBeUndefined();
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should keep a measure on an unanswered static field, so the summary still shows it as missing', () => {
    const result = computeInstrumentMeasures(formInstrument, {});
    expect(result.favoriteNumber).toEqual({ label: 'Favorite Number', value: undefined });
  });
});
