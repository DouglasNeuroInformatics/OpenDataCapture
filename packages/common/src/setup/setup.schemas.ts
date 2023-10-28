import { z } from 'zod';

import { createUserDataSchema } from '../user/user.schemas';

import type { CreateAdminData, SetupOptions } from './setup.types';

export const createAdminDataSchema = createUserDataSchema.omit({
  basePermissionLevel: true,
  groupNames: true
}) satisfies Zod.ZodType<CreateAdminData>;

export const setupOptionsSchema = z.object({
  admin: createAdminDataSchema,
  initDemo: z.boolean()
}) satisfies Zod.ZodType<SetupOptions>;
