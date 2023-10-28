import { z } from 'zod';

import { validObjectIdSchema } from '../core/core.schemas';

import type { Group } from './group.types';

export const groupSchema = z.object({
  id: validObjectIdSchema,
  name: z.string().min(1)
}) satisfies Zod.ZodType<Group>;

export const createGroupDataSchema = groupSchema.omit({ id: true });
