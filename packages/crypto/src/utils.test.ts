import { describe, expect, it } from 'vitest';

import { SerializableUint8Array } from './utils.js';

describe('SerializableUint8Array', () => {
  it('should correctly wrap an ArrayBufferLike object', () => {
    const buffer = new ArrayBuffer(8);
    const uint8Array = new SerializableUint8Array(buffer);
    expect(uint8Array.buffer).toBe(buffer);
  });

  it('toArray returns an array with correct elements', () => {
    const serializableArray = new SerializableUint8Array([1, 2, 3]);
    expect(serializableArray.toArray()).toEqual([1, 2, 3]);
  });

  it('toJSON returns an array similar to toArray', () => {
    const buffer = new Uint8Array([4, 5, 6]);
    const serializableArray = new SerializableUint8Array(buffer);
    expect(serializableArray.toJSON()).toEqual(serializableArray.toArray());
  });
});
