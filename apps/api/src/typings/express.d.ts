/* eslint-disable @typescript-eslint/consistent-type-definitions */

import type { UserModel } from '@open-data-capture/database';

import type { AppAbility } from '@/core/types';

declare global {
  namespace Express {
    // https://stackoverflow.com/questions/66312048/cant-override-express-request-user-type-but-i-can-add-new-properties-to-request
    interface User extends UserModel {
      ability: AppAbility;
    }
  }
}
