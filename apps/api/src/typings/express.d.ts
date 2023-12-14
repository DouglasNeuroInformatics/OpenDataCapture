/* eslint-disable @typescript-eslint/consistent-type-definitions */

import type { BaseAppAbility } from '@open-data-capture/common/core';
import type { User as AppUser } from '@open-data-capture/common/user';

declare global {
  namespace Express {
    // https://stackoverflow.com/questions/66312048/cant-override-express-request-user-type-but-i-can-add-new-properties-to-request
    interface User extends AppUser {
      ability: BaseAppAbility;
    }
  }
}
