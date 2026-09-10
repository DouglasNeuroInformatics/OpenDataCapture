import type { AnyInstrument, SeriesInstrument } from '@opendatacapture/runtime-core';
import type { InstrumentInfo } from '@opendatacapture/schemas/instrument';
import { describe, expect, it } from 'vitest';

import {
  getSeriesInstrumentItems,
  getSeriesInstrumentParams,
  isFileInstrument,
  isFormInstrument,
  isInteractiveInstrument,
  isMultilingualInstrument,
  isMultilingualInstrumentInfo,
  isScalarInstrument,
  isSeriesInstrument,
  isUnilingualInstrument,
  isUnilingualInstrumentInfo
} from '../guards.js';

const unilingualForm = {
  internal: { edition: 1, name: 'STUB' },
  kind: 'FORM',
  language: 'en'
} as unknown as AnyInstrument;
const bilingualFile = {
  internal: { edition: 1, name: 'STUB' },
  kind: 'FILE',
  language: ['en', 'fr']
} as unknown as AnyInstrument;
const interactive = {
  internal: { edition: 1, name: 'STUB' },
  kind: 'INTERACTIVE',
  language: 'en'
} as unknown as AnyInstrument;
const series = { kind: 'SERIES', language: 'en' } as unknown as AnyInstrument;

describe('isUnilingualInstrument and isUnilingualInstrumentInfo', () => {
  it('should return true for an instrument whose language is a single string', () => {
    expect(isUnilingualInstrument(interactive)).toBe(true);
    expect(isUnilingualInstrumentInfo(interactive as unknown as InstrumentInfo)).toBe(true);
  });
  it('should return false for an instrument whose language is an array', () => {
    expect(isUnilingualInstrument(bilingualFile)).toBe(false);
    expect(isUnilingualInstrumentInfo(bilingualFile as unknown as InstrumentInfo)).toBe(false);
  });
});

describe('isMultilingualInstrument and isMultilingualInstrumentInfo', () => {
  it('should return true for an instrument whose language is an array', () => {
    expect(isMultilingualInstrument(bilingualFile)).toBe(true);
    expect(isMultilingualInstrumentInfo(bilingualFile as unknown as InstrumentInfo)).toBe(true);
  });
  it('should return false for an instrument whose language is a single string', () => {
    expect(isMultilingualInstrument(interactive)).toBe(false);
    expect(isMultilingualInstrumentInfo(interactive as unknown as InstrumentInfo)).toBe(false);
  });
});

describe('isFileInstrument', () => {
  it('should return true for a FILE instrument', () => {
    expect(isFileInstrument(bilingualFile)).toBe(true);
  });
  it('should return false for a non-FILE instrument', () => {
    expect(isFileInstrument(unilingualForm)).toBe(false);
  });
});

describe('isFormInstrument', () => {
  it('should return true for a FORM instrument', () => {
    expect(isFormInstrument(unilingualForm)).toBe(true);
  });
  it('should return false for a non-FORM instrument', () => {
    expect(isFormInstrument(bilingualFile)).toBe(false);
  });
});

describe('isInteractiveInstrument', () => {
  it('should return true for an INTERACTIVE instrument', () => {
    expect(isInteractiveInstrument(interactive)).toBe(true);
  });
  it('should return false for a non-INTERACTIVE instrument', () => {
    expect(isInteractiveInstrument(unilingualForm)).toBe(false);
  });
});

describe('isSeriesInstrument', () => {
  it('should return true for a SERIES instrument', () => {
    expect(isSeriesInstrument(series)).toBe(true);
  });
  it('should return false for a non-SERIES instrument', () => {
    expect(isSeriesInstrument(unilingualForm)).toBe(false);
  });
});

describe('isScalarInstrument', () => {
  it('should return true for a scalar instrument, which carries an internal field', () => {
    expect(isScalarInstrument(unilingualForm)).toBe(true);
  });
  it('should return false for a series instrument, which carries no internal field', () => {
    expect(isScalarInstrument(series)).toBe(false);
  });
});

describe('getSeriesInstrumentItems', () => {
  const items: SeriesInstrument.Content = [{ edition: 1, name: 'HAPPINESS_QUESTIONNAIRE' }];

  it('should return the content as-is when it is already the array form', () => {
    expect(getSeriesInstrumentItems(items)).toEqual(items);
  });
  it("should return the content's items when it is the object form", () => {
    expect(getSeriesInstrumentItems({ items })).toEqual(items);
  });
});

describe('getSeriesInstrumentParams', () => {
  const items: SeriesInstrument.Content = [{ edition: 1, name: 'HAPPINESS_QUESTIONNAIRE' }];

  it('should return an empty object when the content is the array form', () => {
    expect(getSeriesInstrumentParams(items)).toEqual({});
  });
  it("should return the content's params when the object form declares them", () => {
    const params = { skipProgress: true };
    expect(getSeriesInstrumentParams({ items: [], params })).toEqual(params);
  });
  it('should return an empty object when the object form declares no params', () => {
    expect(getSeriesInstrumentParams({ items: [] })).toEqual({});
  });
});
