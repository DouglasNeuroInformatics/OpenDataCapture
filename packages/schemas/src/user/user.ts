import { z } from 'zod';

import { $AppAction, $AppSubjectName, $BaseModel } from '../core/core.js';
import { $Sex } from '../subject/subject.js';

export const $BasePermissionLevel = z.enum(['ADMIN', 'GROUP_MANAGER', 'STANDARD']);

export type BasePermissionLevel = z.infer<typeof $BasePermissionLevel>;

export const $AdditionalUserPermissions = z.array(
  z.object({
    action: $AppAction,
    subject: $AppSubjectName
  })
);

export type User = z.infer<typeof $User>;
export const $User = $BaseModel.extend({
  additionalPermissions: $AdditionalUserPermissions,
  basePermissionLevel: $BasePermissionLevel.nullable(),
  dateOfBirth: z.coerce.date().nullish(),
  firstName: z.string().min(1),
  groupIds: z.array(z.string()),
  lastName: z.string().min(1),
  password: z.string().min(1),
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
    password: true,
    username: true
  })
  .extend({
    dateOfBirth: z.coerce.date().optional(),
    sex: $Sex.optional()
  });

export type UpdateUserData = z.infer<typeof $UpdateUserData>;
export const $UpdateUserData = $CreateUserData.partial().extend({
  additionalPermissions: $AdditionalUserPermissions.optional()
});
