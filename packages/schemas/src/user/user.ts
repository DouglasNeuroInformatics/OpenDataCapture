import { z } from 'zod/v4';

import { $BaseModel, $Permissions } from '../core/core.js';
import { $Sex } from '../subject/subject.js';

export const $BasePermissionLevel = z.enum(['ADMIN', 'GROUP_MANAGER', 'STANDARD']);

export type BasePermissionLevel = z.infer<typeof $BasePermissionLevel>;

export type User = z.infer<typeof $User>;
export const $User = $BaseModel.extend({
  additionalPermissions: $Permissions,
  basePermissionLevel: $BasePermissionLevel.nullable(),
  dateOfBirth: z.coerce.date().nullish(),
  email: z.email().nullish(),
  firstName: z.string().min(1),
  groupIds: z.array(z.string()),
  lastName: z.string().min(1),
  phoneNumber: z.string().nullish(),
  sex: $Sex.nullish(),
  username: z.string().min(1)
});

export type CreateUserData = z.infer<typeof $CreateUserData>;
export const $CreateUserData = $User
  .pick({
    basePermissionLevel: true,
    firstName: true,
    groupIds: true,
    lastName: true,
    username: true
  })
  .extend({
    dateOfBirth: z.coerce.date().optional(),
    email: z.email().optional(),
    password: z.string().min(1),
    phoneNumber: z.string().optional(),
    sex: $Sex.optional()
  });

export type UpdateUserData = z.infer<typeof $UpdateUserData>;
export const $UpdateUserData = $CreateUserData.partial().extend({
  additionalPermissions: $Permissions.optional()
});

export type SelfUpdateUserData = z.infer<typeof $SelfUpdateUserData>;
export const $SelfUpdateUserData = $UpdateUserData.partial().omit({
  additionalPermissions: true,
  basePermissionLevel: true,
  groupIds: true
});
