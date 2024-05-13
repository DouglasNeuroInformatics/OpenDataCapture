import { Aes128Gcm, CipherSuite, DhkemP256HkdfSha256, HkdfSha256 } from '@hpke/core';

export type DecryptParams = {
  cipherText: Uint8Array;
  privateKey: CryptoKey;
  symmetricKey: Uint8Array;
};

export type EncryptParams = {
  plainText: string;
  publicKey: CryptoKey;
};

export type EncryptResult = {
  cipherText: Uint8Array;
  symmetricKey: Uint8Array;
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

  static async deserializePrivateKey(privateKey: ArrayBufferLike) {
    return this.suite.kem.deserializePrivateKey(privateKey);
  }

  static async deserializePublicKey(publicKey: ArrayBufferLike) {
    return this.suite.kem.deserializePublicKey(publicKey);
  }

  static async encrypt({ plainText, publicKey }: EncryptParams): Promise<EncryptResult> {
    const sender = await this.suite.createSenderContext({
      recipientPublicKey: publicKey
    });
    return {
      cipherText: new Uint8Array(await sender.seal(this.encoder.encode(plainText))),
      symmetricKey: new Uint8Array(sender.enc)
    };
  }

  static async generateKeyPair() {
    return this.suite.kem.generateKeyPair();
  }

  static async serializeKeyPair({ privateKey, publicKey }: CryptoKeyPair) {
    return {
      privateKey: await this.serializePrivateKey(privateKey),
      publicKey: await this.serializePublicKey(publicKey)
    };
  }

  static async serializePrivateKey(privateKey: CryptoKey) {
    return new Uint8Array(await this.suite.kem.serializePrivateKey(privateKey));
  }

  static async serializePublicKey(publicKey: CryptoKey) {
    return new Uint8Array(await this.suite.kem.serializePublicKey(publicKey));
  }
}
