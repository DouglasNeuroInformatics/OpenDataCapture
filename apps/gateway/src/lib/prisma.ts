import { PublicKey } from '@opendatacapture/crypto';
import { PrismaClient } from '@opendatacapture/prisma-client/gateway';

export const prisma = new PrismaClient().$extends({
  result: {
    remoteAssignmentModel: {
      getPublicKey: {
        compute({ rawPublicKey }) {
          return () => PublicKey.fromRaw(new Uint8Array(rawPublicKey));
        },
        needs: { rawPublicKey: true }
      }
    }
  }
});
