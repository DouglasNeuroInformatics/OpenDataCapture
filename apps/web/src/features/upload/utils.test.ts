//pnpm exec vitest --dir src/features/upload/ -c /dev/null --run

import type { AnyUnilingualFormInstrument } from '@opendatacapture/runtime-core';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import {
  applyLineTransformsArray,
  applyLineTransformsSet,
  getZodTypeName,
  processInstrumentCSV,
  zodObjectInterpreter
} from './utils';

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
  it('should parse a z.set(z.string())', () => {
    expect(getZodTypeName(z.set(z.string()))).toMatchObject({ isOptional: false, success: true, typeName: 'ZodSet' });
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

describe('zodObjectInterpreter', () => {
  it('Should parse array', () => {
    expect(zodObjectInterpreter(z.array(z.object({ foo: z.string() })), 'ZodArray', false)).toMatchObject({
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
    expect(zodObjectInterpreter(z.array(z.object({ foo: z.string() })), 'ZodArray', true)).toMatchObject({
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
    expect(zodObjectInterpreter(z.array(z.object({ foo: z.string().optional() })), 'ZodArray', false)).toMatchObject({
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

describe('applyLineTransformsSet', () => {
  it('should parse a line with a single set', () => {
    expect(applyLineTransformsSet('SET(1, 2, 3)')).toBe('SET(1~~ 2~~ 3)');
  });
  it('should parse a line with a several sets and a number', () => {
    expect(applyLineTransformsSet('SET(1, 2, 3), 5, SET(7, 2)')).toBe('SET(1~~ 2~~ 3), 5, SET(7~~ 2)');
  });
  it('should return the line unchanged, if the line does not contain a set', () => {
    expect(applyLineTransformsSet('1, 2, 3')).toBe('1, 2, 3');
  });
});

describe('applyLineTransformsArray', () => {
  it('should parse a line with a single set', () => {
    expect(applyLineTransformsArray('recordArray(test1:1,test2:2;)')).toBe('recordArray(test1:1++test2:2;)');
  });
  it('should parse a line with a several sets and a number', () => {
    expect(applyLineTransformsArray('recordArray(test1:1,test2:2;), 3, recordArray(test3:3,test4:4;)')).toBe(
      'recordArray(test1:1++test2:2;), 3, recordArray(test3:3++test4:4;)'
    );
  });
  it('should return the line unchanged, if the line does not contain a set', () => {
    expect(applyLineTransformsArray('1, 2, 3')).toBe('1, 2, 3');
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
          foo: z.string()
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
    console.log(await processInstrumentCSV(file, mockInstrument));
    await expect(processInstrumentCSV(file, mockInstrument)).resolves.toMatchObject({ success: true });
  });

  it('should process a valid csv with a set', async () => {
    const file = new File(['subjectID,date,foo\n1,2024-01-01,SET(foo,bar)'], 'data.csv', { type: 'text/csv' });
    console.log(await processInstrumentCSV(file, mockInstrumentSet));
    await expect(processInstrumentCSV(file, mockInstrument)).resolves.toMatchObject({ success: true });
  });

  it('should process a valid csv with a set', async () => {
    const file = new File(['subjectID,date,foo\n1,2024-01-01,recordArray(bar:test1,foo:test2;)'], 'data.csv', {
      type: 'text/csv'
    });
    console.log(await processInstrumentCSV(file, mockInstrumentArray));
    await expect(processInstrumentCSV(file, mockInstrumentArray)).resolves.toMatchObject({ success: true });
  });
});
