import { HybridCrypto } from '@douglasneuroinformatics/libcrypto';

import { PrismaClient } from '.prisma/client';

export const prisma = new PrismaClient().$extends({
  result: {
    remoteAssignmentModel: {
      getPublicKey: {
        compute({ rawPublicKey }) {
          return () => HybridCrypto.deserializePublicKey(rawPublicKey);
        },
        needs: { rawPublicKey: true }
      }
    }
  }
});
