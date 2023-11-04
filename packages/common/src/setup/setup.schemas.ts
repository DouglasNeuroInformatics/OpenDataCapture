import { z } from 'zod';

import { createGroupDataSchema } from '../group/group.schemas';
import { createUserDataSchema } from '../user/user.schemas';

import type { CreateAdminData, SetupOptions } from './setup.types';

export const createAdminDataSchema = createUserDataSchema.omit({
  basePermissionLevel: true,
  groupNames: true
}) satisfies Zod.ZodType<CreateAdminData>;

export const setupOptionsSchema = z.object({
  admin: createAdminDataSchema,
  adminGroup: createGroupDataSchema,
  initDemo: z.boolean()
}) satisfies Zod.ZodType<SetupOptions>;
