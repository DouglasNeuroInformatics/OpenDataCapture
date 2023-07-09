import { AppAbility } from '@ddcp/types';

import { type UserEntity } from '@/users/entities/user.entity.ts';

type AppUser = UserEntity;

declare global {
  namespace Express {
    // https://stackoverflow.com/questions/66312048/cant-override-express-request-user-type-but-i-can-add-new-properties-to-reques
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends AppUser {}

    interface Request {
      ability?: AppAbility;
    }
  }
}
