import { Aes128Gcm, CipherSuite, DhkemP256HkdfSha256, HkdfSha256 } from '@hpke/core';

type DecryptParams = {
  cipherText: Uint8Array;
  privateKey: CryptoKey;
  symmetricKey: Uint8Array;
};

type EncryptParams = {
  plainText: string;
  publicKey: CryptoKey;
};

type EncryptResult = {
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
      privateKey: new Uint8Array(await this.suite.kem.serializePrivateKey(privateKey)),
      publicKey: new Uint8Array(await this.suite.kem.serializePublicKey(publicKey))
    };
  }
}
