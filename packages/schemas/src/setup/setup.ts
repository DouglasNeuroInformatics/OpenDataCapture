import { z } from 'zod/v4';

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
export const $ReleaseInfo = z.discriminatedUnion('type', [$DevelopmentReleaseInfo, $ProductionReleaseInfo]);

export type SetupState = z.infer<typeof $SetupState>;
export const $SetupState = z.object({
  branding: z
    .object({
      customLogoSvg: z.string().optional()
    })
    .nullish(),
  isDemo: z.boolean(),
  isExperimentalFeaturesEnabled: z.boolean().nullish(),
  isGatewayEnabled: z.boolean(),
  isSetup: z.boolean().nullable(),
  release: $ReleaseInfo,
  uptime: z.number()
});

export type UpdateSetupStateData = z.infer<typeof $UpdateSetupStateData>;
export const $UpdateSetupStateData = $SetupState
  .pick({
    branding: true,
    isExperimentalFeaturesEnabled: true
  })
  .partial();

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
