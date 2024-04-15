import { expect, test } from 'vitest';

import { decodeSource, encodeSource } from './share';

test('encoding and decoding string', () => {
  const source = 'console.log("hello world 😀");';
  const encoded = encodeSource(source);
  const decoded = decodeSource(encoded);
  expect(decoded).toBe(source);
});
