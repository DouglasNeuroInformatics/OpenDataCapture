import { z } from 'zod';

import { $CreateUserData } from './user';

export type SetupState = {
  isSetup: boolean | null;
};

export const $CreateAdminData = $CreateUserData.omit({
  basePermissionLevel: true,
  groupNames: true
});

export type CreateAdminData = z.infer<typeof $CreateAdminData>;

export const $SetupOptions = z.object({
  admin: $CreateAdminData,
  initDemo: z.boolean()
});

export type SetupOptions = z.infer<typeof $SetupOptions>;
