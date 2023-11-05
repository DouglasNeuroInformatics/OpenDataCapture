import { z } from 'zod';

import { groupSchema } from '../group/group.schemas';

import type { BasePermissionLevel, CreateUserData, User } from './user.types';

export const passwordSchema = z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, {
  message:
    'Password must be string of 8 or more characters, with a minimum of one upper case letter, lowercase letter, and number'
});

export const basePermissionLevelSchema = z.enum([
  'ADMIN',
  'GROUP_MANAGER',
  'STANDARD'
]) satisfies Zod.ZodType<BasePermissionLevel>;

export const userSchema = z.object({
  basePermissionLevel: basePermissionLevelSchema.optional(),
  firstName: z.string().min(1).optional(),
  groups: groupSchema.array(),
  lastName: z.string().min(1).optional(),
  password: passwordSchema,
  username: z.string().min(1)
}) satisfies Zod.ZodType<User>;

export const createUserDataSchema = userSchema.omit({ groups: true }).extend({
  groupNames: z.array(z.string().min(1)).optional()
}) satisfies Zod.ZodType<CreateUserData>;
