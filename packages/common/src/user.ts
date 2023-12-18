import type { UserModel } from '@open-data-capture/database/core';
import { z } from 'zod';

import { $BaseModel } from './core';
import { $Group, type Group } from './group';

export const $StrongPassword = z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, {
  message:
    'Password must be string of 8 or more characters, with a minimum of one upper case letter, lowercase letter, and number'
});

export const $BasePermissionLevel = z.enum(['ADMIN', 'GROUP_MANAGER', 'STANDARD']);

export type BasePermissionLevel = z.infer<typeof $BasePermissionLevel>;

export type User = Omit<UserModel, 'groupIds'> & {
  groups: Group[];
};

export const $User = $BaseModel.extend({
  basePermissionLevel: $BasePermissionLevel.nullable(),
  firstName: z.string().min(1).nullable(),
  groups: $Group.array(),
  lastName: z.string().min(1).nullable(),
  password: z.string().min(1),
  username: z.string().min(1)
}) satisfies Zod.ZodType<User>;

export const $CreateUserData = $User.omit({ createdAt: true, groups: true, updatedAt: true }).extend({
  groupNames: z.array(z.string().min(1)).optional()
});

export type CreateUserData = z.infer<typeof $CreateUserData>;
