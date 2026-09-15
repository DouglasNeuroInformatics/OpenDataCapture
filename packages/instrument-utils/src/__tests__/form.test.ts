import type { FormInstrument, Language } from '@opendatacapture/runtime-core';
import { describe, expect, it } from 'vitest';

import { extractFieldLabel, getFormFields } from '../form.js';

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

describe('extractFieldLabel', () => {
  const form = { content: { a: fieldA } } as unknown as FormInstrument<TData, Language>;

  it("should return a static field's label directly", () => {
    expect(extractFieldLabel<TData>(form, 'a')).toBe('A');
  });

  it("should call a dynamic field's render function with the given data and return its label", () => {
    const dynamicForm = {
      content: {
        a: {
          deps: [],
          kind: 'dynamic',
          render: (data: { a?: number }) => (data?.a ? { kind: 'number', label: 'Dynamic A', variant: 'input' } : null)
        }
      }
    } as unknown as FormInstrument<TData, Language>;

    expect(extractFieldLabel<TData>(dynamicForm, 'a', { a: 1, b: 2 })).toBe('Dynamic A');
  });

  it("should return undefined when a dynamic field's render function returns null for the given data", () => {
    const dynamicForm = {
      content: {
        a: {
          deps: [],
          kind: 'dynamic',
          render: () => null
        }
      }
    } as unknown as FormInstrument<TData, Language>;

    expect(extractFieldLabel<TData>(dynamicForm, 'a', { a: 1, b: 2 })).toBeUndefined();
  });
});
