/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/consistent-type-definitions */

import type { RequestUser } from '@douglasneuroinformatics/libnest';
import type { ReleaseInfo } from '@opendatacapture/schemas/setup';

declare global {
  const __RELEASE__: ReleaseInfo;
  namespace Express {
    interface User extends RequestUser {}
  }
}
