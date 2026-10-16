import { describe, expect, it } from 'vitest';

import { decryptSecret, encryptSecret } from '../secret-cipher';

const SECRET_KEY = '2622d72669dd194b98cffd9098b0d04b';

describe('secret-cipher', () => {
  it('should round-trip a secret', () => {
    expect(decryptSecret(encryptSecret('hunter2', SECRET_KEY), SECRET_KEY)).toBe('hunter2');
  });

  it('should round-trip a non-ASCII secret', () => {
    const secret = 'pässwörd–✓';
    expect(decryptSecret(encryptSecret(secret, SECRET_KEY), SECRET_KEY)).toBe(secret);
  });

  // A fresh IV per call, so the same secret never produces the same stored value twice.
  it('should produce a different ciphertext each time', () => {
    expect(encryptSecret('hunter2', SECRET_KEY)).not.toBe(encryptSecret('hunter2', SECRET_KEY));
  });

  it('should not contain the plaintext', () => {
    expect(encryptSecret('hunter2', SECRET_KEY)).not.toContain('hunter2');
  });

  it('should throw when the key differs, which is what a rotated SECRET_KEY looks like', () => {
    const encrypted = encryptSecret('hunter2', SECRET_KEY);
    expect(() => decryptSecret(encrypted, 'a-completely-different-key')).toThrow();
  });

  it.each(['not-dot-separated', 'only.two', '', 'aaa.bbb.not-base64-ciphertext'])(
    'should throw on the malformed payload %s',
    (value) => {
      expect(() => decryptSecret(value, SECRET_KEY)).toThrow();
    }
  );

  // GCM authenticates the ciphertext, so a tampered payload must not decrypt to anything.
  it('should throw when the ciphertext has been tampered with', () => {
    const [iv, authTag, ciphertext] = encryptSecret('hunter2', SECRET_KEY).split('.') as [string, string, string];
    const flipped = Buffer.from(ciphertext, 'base64');
    flipped[0] = (flipped[0] ?? 0) ^ 0xff;
    expect(() => decryptSecret([iv, authTag, flipped.toString('base64')].join('.'), SECRET_KEY)).toThrow();
  });
});
