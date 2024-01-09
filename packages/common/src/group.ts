import type { GroupModel } from '@open-data-capture/database/core';
import { z } from 'zod';

import { $BaseModel } from './core';

export type Group = Omit<GroupModel, 'subjectIds' | 'userIds'>;

export const $Group = $BaseModel.extend({
  name: z.string().min(1)
}) satisfies z.ZodType<Group>;

export type CreateGroupData = z.infer<typeof $CreateGroupData>;
export const $CreateGroupData = z.object({
  name: z.string().min(1)
});

export type UpdateGroupData = z.infer<typeof $UpdateGroupData>;
export const $UpdateGroupData = $CreateGroupData.partial();
