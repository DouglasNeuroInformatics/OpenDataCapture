/* eslint-disable @typescript-eslint/consistent-type-definitions */

import type { TokenPayload } from '@opendatacapture/schemas/auth';
import type { ReleaseInfo } from '@opendatacapture/schemas/setup';

import type { AppAbility } from '@/auth/auth.types';

declare global {
  const __RELEASE__: ReleaseInfo;
  namespace Express {
    interface User extends TokenPayload {
      ability: AppAbility;
    }
  }
}
