import { z } from 'zod';

import { $CreateUserData } from './user';

export type SetupStatus = z.infer<typeof $SetupStatus>;
export const $SetupStatus = z.object({
  isSetup: z.boolean()
});

export type SetupState = z.infer<typeof $SetupState>;
export const $SetupState = z.object({
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
  enableGateway: z.boolean(),
  initDemo: z.boolean()
});
