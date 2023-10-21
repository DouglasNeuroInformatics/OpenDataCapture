import type { AppAbility, User as AppUser } from '@open-data-capture/types';

declare global {
  namespace Express {
    // https://stackoverflow.com/questions/66312048/cant-override-express-request-user-type-but-i-can-add-new-properties-to-reques
    // eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/consistent-type-definitions
    interface User extends AppUser {
      ability: AppAbility;
    }
  }
}
