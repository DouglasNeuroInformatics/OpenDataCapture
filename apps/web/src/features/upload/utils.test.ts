//pnpm exec vitest --dir src/features/upload/ -c /dev/null --run

import type { AnyUnilingualFormInstrument } from '@opendatacapture/runtime-core';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { applyLineTransformsSet, getZodTypeName, processInstrumentCSV, applyLineTransformsArray } from './utils';

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
});

describe('applyLineTransformsSet', () => {
  it('should parse a line with a single set', () => {
    expect(applyLineTransformsSet('SET(1, 2, 3)')).toBe('SET(1\\, 2\\, 3)');
  });
  it('should parse a line with a several sets and a number', () => {
    expect(applyLineTransformsSet('SET(1, 2, 3), 5, SET(7, 2)')).toBe('SET(1\\, 2\\, 3), 5, SET(7\\, 2)');
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

  it('should fail to process an empty csv', async () => {
    const file = new File([''], 'data.csv', { type: 'text/csv' });
    await expect(processInstrumentCSV(file, mockInstrument)).resolves.toMatchObject({ success: false });
  });

  it('should process a valid csv', async () => {
    const file = new File(['subjectID,date,foo\n1,2024-01-01,bar'], 'data.csv', { type: 'text/csv' });
    console.log(await processInstrumentCSV(file, mockInstrument));
    await expect(processInstrumentCSV(file, mockInstrument)).resolves.toMatchObject({ success: true });
  });
});
