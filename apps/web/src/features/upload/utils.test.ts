// @vitest-environment node

//pnpm exec vitest --dir src/features/upload/ -c /dev/null --run

import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { applyLineTransforms, getZodTypeName } from './utils';

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

describe('applyLineTransforms', () => {
  it('should parse a line with a single set', () => {
    expect(applyLineTransforms('SET(1, 2, 3)')).toBe('SET(1\\, 2\\, 3)');
  });
  it('should parse a line with a several sets and a number', () => {
    expect(applyLineTransforms('SET(1, 2, 3), 5, SET(7, 2)')).toBe('SET(1\\, 2\\, 3), 5, SET(7\\, 2)');
  });
  it('should return the line unchanged, if the line does not contain a set', () => {
    expect(applyLineTransforms('1, 2, 3')).toBe('1, 2, 3');
  });
});
