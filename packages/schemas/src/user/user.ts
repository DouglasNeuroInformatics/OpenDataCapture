import { z } from 'zod/v4';

import { $BaseModel, $Permissions } from '../core/core.js';
import { $Sex } from '../subject/subject.js';

export const $BasePermissionLevel = z.enum(['ADMIN', 'GROUP_MANAGER', 'STANDARD']);

export type BasePermissionLevel = z.infer<typeof $BasePermissionLevel>;

/**
 * Stable, machine-readable codes for the reasons the API can reject a password. These are
 * returned as the `code` property of the error response body so the web client can show a
 * localized message; the API itself does not need to localize.
 */
export const PASSWORD_ERROR_CODES = [
  'INSUFFICIENT_PASSWORD_STRENGTH',
  'PASSWORD_MATCHES_USERNAME',
  'PASSWORD_IN_DATA_BREACH'
] as const;

export type PasswordErrorCode = (typeof PASSWORD_ERROR_CODES)[number];

export type User = z.infer<typeof $User>;
export const $User = $BaseModel.extend({
  additionalPermissions: $Permissions,
  basePermissionLevel: $BasePermissionLevel.nullable(),
  dateOfBirth: z.coerce.date().nullish(),
  disabled: z.boolean().nullish(),
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
    disabled: z.boolean().optional(),
    email: z.email().optional(),
    password: z.string().min(1),
    phoneNumber: z.string().optional(),
    sex: $Sex.optional()
  });

export type UpdateUserData = z.infer<typeof $UpdateUserData>;
export const $UpdateUserData = $CreateUserData.partial().extend({
  additionalPermissions: $Permissions.optional()
});

export type $SelfUpdateUserData = z.infer<typeof $SelfUpdateUserData>;
export const $SelfUpdateUserData = $UpdateUserData
  .pick({
    dateOfBirth: true,
    email: true,
    firstName: true,
    lastName: true,
    password: true,
    phoneNumber: true,
    sex: true
  })
  .partial();
