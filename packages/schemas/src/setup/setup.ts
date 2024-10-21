import { z } from 'zod';

import { $CreateUserData } from '../user/user.js';

export const $ReleaseVersion = z.string().regex(/[0-9]+.[0-9]+.[0-9]+/);

export type DevelopmentReleaseInfo = z.infer<typeof $DevelopmentReleaseInfo>;
export const $DevelopmentReleaseInfo = z.object({
  branch: z.string().min(1),
  buildTime: z.number(),
  commit: z.string().length(8),
  type: z.enum(['development', 'test']),
  version: $ReleaseVersion
});

export type ProductionReleaseInfo = z.infer<typeof $ProductionReleaseInfo>;
export const $ProductionReleaseInfo = z.object({
  buildTime: z.number(),
  type: z.literal('production'),
  version: $ReleaseVersion
});

export type ReleaseInfo = z.infer<typeof $ReleaseInfo>;
export const $ReleaseInfo = z.union([$DevelopmentReleaseInfo, $ProductionReleaseInfo]);

export type SetupState = z.infer<typeof $SetupState>;
export const $SetupState = z.object({
  isDemo: z.boolean(),
  isExperimentalFeaturesEnabled: z.boolean(),
  isGatewayEnabled: z.boolean(),
  isSetup: z.boolean().nullable(),
  release: $ReleaseInfo,
  uptime: z.number()
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
  enableExperimentalFeatures: z.boolean(),
  initDemo: z.boolean(),
  recordsPerSubject: z.number().int().nonnegative().optional()
});
