import { Aes128Gcm, CipherSuite, DhkemP256HkdfSha256, HkdfSha256 } from '@hpke/core';

import { SerializableUint8Array } from './utils.js';

type DecryptParams = {
  cipherText: ArrayBufferLike;
  privateKey: CryptoKey;
  symmetricKey: ArrayBufferLike;
};

type EncryptParams = {
  plainText: string;
  publicKey: CryptoKey;
};

type EncryptResult = {
  cipherText: ArrayBufferLike;
  symmetricKey: ArrayBufferLike;
};

export class HybridCrypto {
  private static decoder = new TextDecoder();
  private static encoder = new TextEncoder();
  private static suite = new CipherSuite({
    aead: new Aes128Gcm(),
    kdf: new HkdfSha256(),
    kem: new DhkemP256HkdfSha256()
  });

  static async decrypt({ cipherText, privateKey, symmetricKey }: DecryptParams): Promise<string> {
    const recipient = await this.suite.createRecipientContext({
      enc: symmetricKey,
      recipientKey: privateKey
    });
    return this.decoder.decode(await recipient.open(cipherText));
  }

  static async encrypt({ plainText, publicKey }: EncryptParams): Promise<EncryptResult> {
    const sender = await this.suite.createSenderContext({
      recipientPublicKey: publicKey
    });
    return {
      cipherText: await sender.seal(this.encoder.encode(plainText)),
      symmetricKey: sender.enc
    };
  }

  static async generateKeyPair() {
    return this.suite.kem.generateKeyPair();
  }

  static async serializeKeyPair({ privateKey, publicKey }: CryptoKeyPair) {
    return {
      privateKey: new SerializableUint8Array(await this.suite.kem.serializePrivateKey(privateKey)),
      publicKey: new SerializableUint8Array(await this.suite.kem.serializePublicKey(publicKey))
    };
  }
}
