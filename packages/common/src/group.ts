import { z } from 'zod';

import { $ValidObjectId } from './core';

export const $Group = z.object({
  id: $ValidObjectId,
  name: z.string().min(1)
});

export type Group = z.infer<typeof $Group>;

export const $CreateGroupData = $Group.omit({ id: true });

export type CreateGroupData = z.infer<typeof $CreateGroupData>;
