import { z } from 'zod';

import { $CreateUserData } from './user';

export type SetupState = z.infer<typeof $SetupState>;
export const $SetupState = z.object({
  isSetup: z.boolean().nullable()
});

export type CreateAdminData = z.infer<typeof $CreateAdminData>;
export const $CreateAdminData = $CreateUserData.omit({
  basePermissionLevel: true,
  groupIds: true
});

export type SetupOptions = z.infer<typeof $SetupOptions>;
export const $SetupOptions = z.object({
  admin: $CreateAdminData,
  initDemo: z.boolean()
});
