import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { $BooleanString, $Uint8Array, isZodType } from './core.js';

describe('isZodType', () => {
  it('should return true for an instance of ZodNumber', () => {
    expect(isZodType(z.number())).toBe(true);
  });
  it('should return true for an instance of ZodObject', () => {
    expect(isZodType(z.object({}))).toBe(true);
  });
  it('should return false for null', () => {
    expect(isZodType(null)).toBe(false);
  });
  it('should return false for any empty object', () => {
    expect(isZodType({})).toBe(false);
  });
  it('should return false for an object with a null prototype', () => {
    expect(isZodType(Object.create(null))).toBe(false);
  });
});

describe('$BooleanString', () => {
  it('should successfully parse boolean values', async () => {
    await expect($BooleanString.parseAsync(true)).resolves.toBe(true);
    await expect($BooleanString.parseAsync(false)).resolves.toBe(false);
  });
  it('should successfully parse boolean strings', async () => {
    await expect($BooleanString.parseAsync('true')).resolves.toBe(true);
    await expect($BooleanString.parseAsync('false')).resolves.toBe(false);
  });
  it('should reject arbitrary strings', async () => {
    await expect(() => $BooleanString.parseAsync('')).rejects.toThrow();
    await expect(() => $BooleanString.parseAsync('foo')).rejects.toThrow();
  });
});

describe('$Uint8Array', () => {
  it('should parse an empty array', async () => {
    await expect($Uint8Array.parseAsync([])).resolves.toBeInstanceOf(Uint8Array);
  });
  it('should parse an array with values in range', async () => {
    await expect($Uint8Array.parseAsync([0, 255])).resolves.toBeInstanceOf(Uint8Array);
  });
  it('should fail to parse an array with values out of range', async () => {
    await expect(() => $Uint8Array.parseAsync([-1, 255])).rejects.toThrow();
    await expect(() => $Uint8Array.parseAsync([0, 256])).rejects.toThrow();
  });
  it('should parse a UInt8Array', async () => {
    await expect($Uint8Array.parseAsync(new Uint8Array([0, 255]))).resolves.toBeInstanceOf(Uint8Array);
  });
});
