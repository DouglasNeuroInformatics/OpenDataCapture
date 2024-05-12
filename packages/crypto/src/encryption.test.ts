import crypto from 'node:crypto';

import { beforeAll, describe, expect, it } from 'vitest';

import { HybridCrypto } from './encryption.js';

describe('HybridCrypto', () => {
  describe('generateKeyPair', () => {
    it('should create a public-private key pair', async () => {
      await expect(HybridCrypto.generateKeyPair()).resolves.toMatchObject({
        privateKey: expect.any(CryptoKey),
        publicKey: expect.any(CryptoKey)
      });
    });
  });
  describe('serializeKeyPair', () => {
    it('should serialize a public-private key pair', async () => {
      const keyPair = await HybridCrypto.generateKeyPair();
      await expect(HybridCrypto.serializeKeyPair(keyPair)).resolves.toMatchObject({
        privateKey: expect.any(Uint8Array),
        publicKey: expect.any(Uint8Array)
      });
    });
  });
  describe('encrypt and decrypt', () => {
    let publicKey: CryptoKey;
    let privateKey: CryptoKey;

    beforeAll(async () => {
      ({ privateKey, publicKey } = await HybridCrypto.generateKeyPair());
    });

    it('encrypt and decrypt unicode', async () => {
      const plainText = 'Cela devrait fonctionner avec les caractères unicode 😃';
      const { cipherText, symmetricKey } = await HybridCrypto.encrypt({ plainText, publicKey });
      const decrypted = await HybridCrypto.decrypt({ cipherText, privateKey, symmetricKey });
      expect(decrypted).toBe(plainText);
    });

    it('encrypt and decrypt 100,000,000 random bytes (100 MB)', async () => {
      const plainText = crypto.randomBytes(100000000).toString('hex');
      const { cipherText, symmetricKey } = await HybridCrypto.encrypt({ plainText, publicKey });
      const decrypted = await HybridCrypto.decrypt({ cipherText, privateKey, symmetricKey });
      expect(decrypted).toBe(plainText);
    });
  });
});
