import { z } from 'zod';

import { $BaseModel } from '../core/core.js';
import { $Group } from '../group/group.js';

export const $BasePermissionLevel = z.enum(['ADMIN', 'GROUP_MANAGER', 'STANDARD']);

export type BasePermissionLevel = z.infer<typeof $BasePermissionLevel>;

export type User = z.infer<typeof $User>;
export const $User = $BaseModel.extend({
  basePermissionLevel: $BasePermissionLevel.nullable(),
  firstName: z.string().min(1),
  groupIds: z.array(z.string()),
  groups: z.array($Group),
  lastName: z.string().min(1),
  password: z.string().min(1),
  username: z.string().min(1)
});

export type CreateUserData = z.infer<typeof $CreateUserData>;
export const $CreateUserData = $User.pick({
  basePermissionLevel: true,
  firstName: true,
  groupIds: true,
  lastName: true,
  password: true,
  username: true
});

export type UpdateUserData = z.infer<typeof $UpdateUserData>;
export const $UpdateUserData = $CreateUserData.partial();
