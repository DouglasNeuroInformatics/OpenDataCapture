import type { FormInstrument, Language } from '@opendatacapture/runtime-core';
import { describe, expect, it } from 'vitest';

import { getFormFields } from '../form.js';

type TData = { a: number; b: number };

const fieldA: FormInstrument.UnknownField<TData, 'a', Language> = { kind: 'number', label: 'A', variant: 'input' };
const fieldB: FormInstrument.UnknownField<TData, 'b', Language> = { kind: 'number', label: 'B', variant: 'input' };

describe('getFormFields', () => {
  it('should return the fields as-is when content is the object form', () => {
    const content: FormInstrument.Content<TData, Language> = { a: fieldA, b: fieldB };
    expect(getFormFields(content)).toEqual({ a: fieldA, b: fieldB });
  });

  it('should merge the fields of every group in the array form', () => {
    const content: FormInstrument.Content<TData, Language> = [{ fields: { a: fieldA } }, { fields: { b: fieldB } }];
    expect(getFormFields(content)).toEqual({ a: fieldA, b: fieldB });
  });

  it('should skip blocks when flattening the array form', () => {
    const content: FormInstrument.Content<TData, Language> = [
      { kind: 'block', render: () => null },
      { fields: { a: fieldA } },
      { kind: 'block', render: () => null },
      { fields: { b: fieldB } }
    ];
    expect(getFormFields(content)).toEqual({ a: fieldA, b: fieldB });
  });
});
