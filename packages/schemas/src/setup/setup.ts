import { z } from 'zod';

import { $CreateUserData } from '../user/user.js';

export type SetupState = z.infer<typeof $SetupState>;
export const $SetupState = z.object({
  isDemo: z.boolean(),
  isGatewayEnabled: z.boolean(),
  isSetup: z.boolean().nullable()
});

export type CreateAdminData = z.infer<typeof $CreateAdminData>;
export const $CreateAdminData = $CreateUserData.omit({
  basePermissionLevel: true,
  groupIds: true
});

export type InitAppOptions = z.infer<typeof $InitAppOptions>;
export const $InitAppOptions = z.object({
  admin: $CreateAdminData,
  dummySubjectCount: z.number().int().nonnegative().optional(),
  initDemo: z.boolean()
});
