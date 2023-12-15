import { z } from 'zod';

import { $BaseModel } from './core';
import type { GroupModel } from '@open-data-capture/database/core';

export type Group = Omit<GroupModel, 'userIds' | 'subjectIds'>;

export const $Group = $BaseModel.extend({
  name: z.string().min(1)
}) satisfies Zod.ZodType<Group>;

export const $CreateGroupData = z.object({
  name: z.string().min(1)
});

export type CreateGroupData = z.infer<typeof $CreateGroupData>;
