import { HybridCrypto } from '@opendatacapture/crypto';
import { PrismaClient } from '@opendatacapture/prisma-client/gateway';

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
