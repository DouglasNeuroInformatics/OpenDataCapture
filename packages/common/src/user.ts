import { z } from 'zod';

export const $StrongPassword = z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, {
  message:
    'Password must be string of 8 or more characters, with a minimum of one upper case letter, lowercase letter, and number'
});

export const $BasePermissionLevel = z.enum(['ADMIN', 'GROUP_MANAGER', 'STANDARD']);

export type BasePermissionLevel = z.infer<typeof $BasePermissionLevel>;

export const $User = z.object({
  basePermissionLevel: $BasePermissionLevel.nullable(),
  firstName: z.string().min(1).nullable(),
  groups: groupSchema.array(),
  lastName: z.string().min(1).nullable(),
  password: z.string().min(1),
  username: z.string().min(1)
}) satisfies Zod.ZodType<User>;

export type User = {
  basePermissionLevel?: BasePermissionLevel;
  firstName: string;
  groups: Group[];
  id?: string;
  lastName: string;
  password: string;
  username: string;
};

export type CreateUserData = Omit<User, 'groups'> & {
  groupNames?: string[];
};

export const createUserDataSchema = userSchema.omit({ groups: true }).extend({
  groupNames: z.array(z.string().min(1)).optional()
}) satisfies Zod.ZodType<CreateUserData>;
