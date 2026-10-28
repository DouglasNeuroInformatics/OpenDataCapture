import type { webcrypto } from 'node:crypto';

import { HybridCrypto } from '@douglasneuroinformatics/libcrypto';
import { describe, expect, it, vi } from 'vitest';

type PublicKeyField = {
  compute: (model: { rawPublicKey: Uint8Array }) => () => Promise<webcrypto.CryptoKey>;
  needs: { rawPublicKey: boolean };
};

type ResultExtension = {
  result: { remoteAssignmentModel: { getPublicKey: PublicKeyField } };
};

const extensions = vi.hoisted((): ResultExtension[] => []);

const extendedClient = vi.hoisted(() => ({}));

vi.mock('@prisma/generated-client', () => ({
  PrismaClient: class {
    $extends(extension: ResultExtension) {
      extensions.push(extension);
      return extendedClient;
    }
  }
}));

const { prisma } = await import('../prisma');

const getPublicKey = extensions[0]!.result.remoteAssignmentModel.getPublicKey;

describe('prisma', () => {
  it('should export the client returned by $extends, so every consumer gets the computed public key', () => {
    expect(prisma).toBe(extendedClient);
  });

  it('should always select the raw public key, since the computed field is derived from it', () => {
    expect(getPublicKey.needs).toEqual({ rawPublicKey: true });
  });

  it('should deserialize the stored raw public key into the key used to encrypt responses', async () => {
    const { publicKey } = await HybridCrypto.generateKeyPair();
    const rawPublicKey = await HybridCrypto.serializePublicKey(publicKey);
    const deserialized = await getPublicKey.compute({ rawPublicKey })();
    expect(await HybridCrypto.serializePublicKey(deserialized)).toEqual(rawPublicKey);
  });
});
