import { describe, expect, it } from 'vitest';

import { decodeBase64ToUnicode, encodeUnicodeToBase64, evaluateInstrument, removeSubjectIdScope } from '../index.js';

describe('evaluateInstrument', () => {
  it('should evaluate a bundle string as a JavaScript expression', async () => {
    await expect(evaluateInstrument('({ value: 42 })')).resolves.toEqual({ value: 42 });
  });
  it('should await a bundle that resolves to a promise', async () => {
    await expect(evaluateInstrument('Promise.resolve(42)')).resolves.toBe(42);
  });
});

describe('encodeUnicodeToBase64 and decodeBase64ToUnicode', () => {
  it('should round-trip a string containing multi-byte characters', () => {
    const original = 'héllo wörld 😀';
    expect(decodeBase64ToUnicode(encodeUnicodeToBase64(original))).toBe(original);
  });
  it('should encode ASCII the same way as btoa', () => {
    expect(encodeUnicodeToBase64('hello')).toBe(btoa('hello'));
  });
});

describe('removeSubjectIdScope', () => {
  it('should strip the group scope from a scoped subject ID', () => {
    expect(removeSubjectIdScope('root$123')).toBe('123');
  });
  it('should return the ID unchanged when it carries no scope', () => {
    expect(removeSubjectIdScope('123')).toBe('123');
  });
});
