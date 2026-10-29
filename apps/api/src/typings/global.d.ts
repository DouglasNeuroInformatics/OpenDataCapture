/* eslint-disable @typescript-eslint/no-empty-object-type -- Express.User is augmented by declaration merging, which needs an interface; this one only inherits RequestUser */
/* eslint-disable @typescript-eslint/consistent-type-definitions -- declaration merging with Express.User requires an interface, not a type alias */

import type { RequestUser } from '@douglasneuroinformatics/libnest';
import type { ReleaseInfo } from '@opendatacapture/schemas/setup';

declare global {
  const __RELEASE__: ReleaseInfo;
  namespace Express {
    interface User extends RequestUser {}
  }
}
