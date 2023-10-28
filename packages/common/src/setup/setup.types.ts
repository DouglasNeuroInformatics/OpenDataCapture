import type { CreateUserData } from '../user/user.types';

export type SetupState = {
  isSetup: boolean | null;
};

export type CreateAdminData = Omit<CreateUserData, 'basePermissionLevel' | 'groupNames'>;

export type SetupOptions = {
  admin: CreateAdminData;
  initDemo: boolean;
};
