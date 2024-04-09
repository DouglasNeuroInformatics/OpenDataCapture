import { z } from 'zod';

import { $BaseModel } from '../core/core.js';

export type Group = z.infer<typeof $Group>;
export const $Group = $BaseModel.extend({
  name: z.string().min(1),
  subjectIds: z.array(z.string()),
  userIds: z.array(z.string())
});

export type CreateGroupData = z.infer<typeof $CreateGroupData>;
export const $CreateGroupData = z.object({
  name: z.string().min(1)
});

export type UpdateGroupData = z.infer<typeof $UpdateGroupData>;
export const $UpdateGroupData = $CreateGroupData.partial();
