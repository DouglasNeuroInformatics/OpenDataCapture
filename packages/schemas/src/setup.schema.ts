import type { CreateAdminData, SetupOptions } from '@open-data-capture/types';
import { type ZodType, z } from 'zod';

import { createUserDataSchema } from './user.schema';

export const createAdminDataSchema = createUserDataSchema.omit({
  basePermissionLevel: true,
  groupNames: true
}) satisfies ZodType<CreateAdminData>;

export const setupOptionsSchema = z.object({
  admin: createAdminDataSchema,
  initDemo: z.boolean()
}) satisfies ZodType<SetupOptions>;
