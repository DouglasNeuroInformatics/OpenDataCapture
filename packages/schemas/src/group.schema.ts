import type { Group } from '@open-data-capture/types';
import { type ZodType, z } from 'zod';

import { validObjectIdSchema } from './core.schema';

export const groupSchema = z.object({
  id: validObjectIdSchema,
  name: z.string().min(1)
}) satisfies ZodType<Group>;

export const createGroupDataSchema = groupSchema.omit({ id: true });
