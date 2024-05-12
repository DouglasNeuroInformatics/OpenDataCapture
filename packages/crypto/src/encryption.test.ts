import crypto from 'node:crypto';

import { beforeAll, describe, expect, it } from 'vitest';

import { AsymmetricEncryptionKeyPair, Decrypter, Encrypter, PrivateKey, PublicKey } from './encryption.js';
import { SerializableUint8Array } from './utils.js';

describe('AsymmetricEncryptionKeyPair', () => {
  let keyPair: AsymmetricEncryptionKeyPair;

  beforeAll(async () => {
    keyPair = await AsymmetricEncryptionKeyPair.generate();
  });

  describe('generate', () => {
    it('should create a privateKey and publicKey', () => {
      expect(keyPair.privateKey).toBeInstanceOf(PrivateKey);
      expect(keyPair.publicKey).toBeInstanceOf(PublicKey);
    });
    it('should return an AsymmetricEncryptionKeyPair instance', () => {
      expect(keyPair).toBeInstanceOf(AsymmetricEncryptionKeyPair);
    });
  });

  describe('fromRaw', () => {
    it('should create an AsymmetricEncryptionKeyPair instance', async () => {
      const rawKeyPair = await keyPair.toRaw();
      const newKeyPair = await AsymmetricEncryptionKeyPair.fromRaw(rawKeyPair);
      expect(newKeyPair).toBeInstanceOf(AsymmetricEncryptionKeyPair);
      expect(newKeyPair.privateKey).toBeInstanceOf(PrivateKey);
      expect(newKeyPair.publicKey).toBeInstanceOf(PublicKey);
    });
  });

  describe('toRaw', () => {
    it('should return RawAsymmetricEncryptionKeyPair', async () => {
      const rawKeyPair = await keyPair.toRaw();
      expect(rawKeyPair).toHaveProperty('privateKey');
      expect(rawKeyPair).toHaveProperty('publicKey');
      expect(rawKeyPair.privateKey).toBeInstanceOf(SerializableUint8Array);
      expect(rawKeyPair.publicKey).toBeInstanceOf(SerializableUint8Array);
    });
  });

  describe('toRaw and fromRaw', () => {
    it('should be able to export the keys to raw, and then import those keys', async () => {
      const exportedKeys = await keyPair.toRaw();
      const importedKeys = await AsymmetricEncryptionKeyPair.fromRaw(exportedKeys);
      const reexportedKeys = await importedKeys.toRaw();
      expect(exportedKeys).toMatchObject(reexportedKeys);
    });
  });
});

describe('Encrypter and Decrypter', () => {
  describe('encrypt and decrypt', () => {
    const originalText = 'Cela devrait fonctionner avec les caractères unicode 😃';
    let decrypter: Decrypter;
    let encrypter: Encrypter;

    beforeAll(async () => {
      const { privateKey, publicKey } = await AsymmetricEncryptionKeyPair.generate();
      decrypter = new Decrypter(privateKey);
      encrypter = new Encrypter(publicKey);
    });

    it('encrypt should return an instance of SerializableUint8Array', async () => {
      const encrypted = await encrypter.encrypt(originalText);
      expect(encrypted).toBeInstanceOf(SerializableUint8Array);
    });

    it('decrypt should return original text', async () => {
      const encrypted = await encrypter.encrypt(originalText);
      const decrypted = await decrypter.decrypt(encrypted);
      expect(decrypted).toBe(originalText);
    });

    it('should work with very large data', async () => {
      const originalText = crypto.randomBytes(100000000).toString('hex');
      const encrypted = await encrypter.encrypt(originalText);
      const decrypted = await decrypter.decrypt(encrypted);
      expect(decrypted).toBe(originalText);
    });
  });

  describe('integration with AsymmetricEncryptionKeyPair', () => {
    const originalText = 'Cela devrait fonctionner avec les caractères unicode 😃';
    let keyPair: AsymmetricEncryptionKeyPair;

    beforeAll(async () => {
      keyPair = await AsymmetricEncryptionKeyPair.generate();
    });

    it('should fail decrypting with a different private key', async () => {
      const encrypter = new Encrypter(keyPair.publicKey);
      const encrypted = await encrypter.encrypt(originalText);
      const newKeyPair = await AsymmetricEncryptionKeyPair.generate();
      const newDecrypter = new Decrypter(newKeyPair.privateKey);
      await expect(newDecrypter.decrypt(encrypted)).rejects.toThrow();
    });

    it('should be able to encrypt data, export the key, import the key, and decode the data', async () => {
      const encrypter = new Encrypter(keyPair.publicKey);
      const encrypted = await encrypter.encrypt(originalText);
      const rawKeyPair = await keyPair.toRaw();
      const importedKeyPair = await AsymmetricEncryptionKeyPair.fromRaw(rawKeyPair);
      const decrypter = new Decrypter(importedKeyPair.privateKey);
      const decrypted = await decrypter.decrypt(encrypted);
      expect(decrypted).toBe(originalText);
    });
  });
});
