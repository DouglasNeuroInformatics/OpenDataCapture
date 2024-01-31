import { PublicKey } from '@douglasneuroinformatics/crypto';
import { PrismaClient } from '@open-data-capture/database/gateway';

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
