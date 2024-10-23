//pnpm exec vitest --dir src/features/upload/ -c /dev/null --run

import type { AnyUnilingualFormInstrument } from '@opendatacapture/runtime-core';
import { unparse } from 'papaparse';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { getZodTypeName, interpretZodArray, processInstrumentCSV } from './utils';

describe('getZodTypeName', () => {
  it('should parse a z.string()', () => {
    expect(getZodTypeName(z.string())).toMatchObject({ isOptional: false, success: true, typeName: 'ZodString' });
  });
  it('should parse a z.number()', () => {
    expect(getZodTypeName(z.number())).toMatchObject({ isOptional: false, success: true, typeName: 'ZodNumber' });
  });
  it('should parse a z.boolean()', () => {
    expect(getZodTypeName(z.boolean())).toMatchObject({ isOptional: false, success: true, typeName: 'ZodBoolean' });
  });
  it('should parse a z.set(z.enum([]))', () => {
    expect(getZodTypeName(z.set(z.enum(['a', 'b', 'c'])))).toMatchObject({
      isOptional: false,
      success: true,
      typeName: 'ZodSet'
    });
  });
  it('should parse a z.string().optional()', () => {
    expect(getZodTypeName(z.string().optional())).toMatchObject({
      isOptional: true,
      success: true,
      typeName: 'ZodString'
    });
  });
  it('Should parse z.enum()', () => {
    expect(getZodTypeName(z.enum(['test1', 'test2']))).toMatchObject({
      enumValues: ['test1', 'test2'],
      isOptional: false,
      success: true,
      typeName: 'ZodEnum'
    });
  });
  it('should parse z.array(z.object({foo: z.string()}))', () => {
    expect(getZodTypeName(z.array(z.object({ foo: z.string() })))).toMatchObject({
      isOptional: false,
      multiKeys: ['foo'],
      multiValues: [
        {
          isOptional: false,
          success: true,
          typeName: 'ZodString'
        }
      ],
      success: true,
      typeName: 'ZodArray'
    });
  });
  it('should parse z.array(z.object({foo: z.string()}).optional()', () => {
    expect(getZodTypeName(z.array(z.object({ foo: z.string() })).optional())).toMatchObject({
      isOptional: true,
      multiKeys: ['foo'],
      multiValues: [
        {
          isOptional: false,
          success: true,
          typeName: 'ZodString'
        }
      ],
      success: true,
      typeName: 'ZodArray'
    });
  });
  it('should parse z.array(z.object({foo: z.string()}).optional()', () => {
    expect(getZodTypeName(z.array(z.object({ foo: z.string().optional() })))).toMatchObject({
      isOptional: false,
      multiKeys: ['foo'],
      multiValues: [
        {
          isOptional: true,
          success: true,
          typeName: 'ZodString'
        }
      ],
      success: true,
      typeName: 'ZodArray'
    });
  });
  it('should parse z.array(z.object({foo: z.enum()})', () => {
    expect(getZodTypeName(z.array(z.object({ foo: z.enum(['test1', 'test2']) })))).toMatchObject({
      isOptional: false,
      multiKeys: ['foo'],
      multiValues: [
        {
          enumValues: ['test1', 'test2'],
          isOptional: false,
          success: true,
          typeName: 'ZodEnum'
        }
      ],
      success: true,
      typeName: 'ZodArray'
    });
  });
});

describe('interpretZodArray', () => {
  it('Should parse array', () => {
    expect(
      interpretZodArray(z.array(z.object({ foo: z.string() })), z.ZodFirstPartyTypeKind.ZodArray, false)
    ).toMatchObject({
      isOptional: false,
      multiKeys: ['foo'],
      multiValues: [
        {
          isOptional: false,
          success: true,
          typeName: 'ZodString'
        }
      ],
      success: true,
      typeName: 'ZodArray'
    });
  });
  it('Should parse optional array', () => {
    expect(
      interpretZodArray(z.array(z.object({ foo: z.string() })), z.ZodFirstPartyTypeKind.ZodArray, true)
    ).toMatchObject({
      isOptional: true,
      multiKeys: ['foo'],
      multiValues: [
        {
          isOptional: false,
          success: true,
          typeName: 'ZodString'
        }
      ],
      success: true,
      typeName: 'ZodArray'
    });
  });
  it('Should parse array with optional field', () => {
    expect(
      interpretZodArray(z.array(z.object({ foo: z.string().optional() })), z.ZodFirstPartyTypeKind.ZodArray, false)
    ).toMatchObject({
      isOptional: false,
      multiKeys: ['foo'],
      multiValues: [
        {
          isOptional: true,
          success: true,
          typeName: 'ZodString'
        }
      ],
      success: true,
      typeName: 'ZodArray'
    });
  });
});

describe('processInstrumentCSV', () => {
  const mockInstrument = { validationSchema: z.object({ foo: z.string() }) } satisfies Pick<
    AnyUnilingualFormInstrument,
    'validationSchema'
  > as any;

  const mockInstrumentSet = { validationSchema: z.object({ foo: z.set(z.enum(['foo', 'bar'])) }) } satisfies Pick<
    AnyUnilingualFormInstrument,
    'validationSchema'
  > as any;

  const mockInstrumentArray = {
    validationSchema: z.object({
      foo: z.array(
        z.object({
          bar: z.string(),
          foo2: z.string()
        })
      )
    })
  } satisfies Pick<AnyUnilingualFormInstrument, 'validationSchema'> as any;

  it('should fail to process an empty csv', async () => {
    const file = new File([''], 'data.csv', { type: 'text/csv' });
    await expect(processInstrumentCSV(file, mockInstrument)).resolves.toMatchObject({ success: false });
  });

  it('should process a valid csv', async () => {
    const file = new File(['subjectID,date,foo\n1,2024-01-01,bar'], 'data.csv', { type: 'text/csv' });
    await expect(processInstrumentCSV(file, mockInstrument)).resolves.toMatchObject({ success: true });
  });

  it('should process a valid csv with a set', async () => {
    const papaString = unparse([
      ['subjectID', 'date', 'foo'],
      ['1', '2024-01-01', 'SET(foo,bar)']
    ]);
    const file = new File([papaString], 'data.csv', { type: 'text/csv' });
    await expect(processInstrumentCSV(file, mockInstrumentSet)).resolves.toMatchObject({ success: true });
  });

  it('should process a valid csv with a record array', async () => {
    const papaString = unparse([
      ['subjectID', 'date', 'foo'],
      ['1', '2024-01-01', 'RECORD_ARRAY(bar:test1,foo2:test2;)']
    ]);
    const file = new File([papaString], 'data.csv', {
      type: 'text/csv'
    });
    await expect(processInstrumentCSV(file, mockInstrumentArray)).resolves.toMatchObject({ success: true });
  });
});
