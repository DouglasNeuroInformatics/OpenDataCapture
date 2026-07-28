import { z } from 'zod/v4';

import { $BaseModel, $Permissions } from '../core/core.js';
import { $Sex } from '../subject/subject.js';

const MIN_PHONE_DIGITS = 7;

const PHONE_NUMBER_FORMAT = /^\+?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,9}$/;

const PHONE_NUMBER_ERROR_MESSAGES = {
  INVALID_FORMAT: 'Invalid phone number',
  TOO_FEW_DIGITS: `Phone number must contain at least ${MIN_PHONE_DIGITS} digits`
};

type PhoneNumberErrorCode = keyof typeof PHONE_NUMBER_ERROR_MESSAGES;

function countPhoneDigits(value: string): number {
  return value.replace(/\D/g, '').length;
}

/**
 * The reason a phone number is rejected, in the same spirit as {@link PASSWORD_ERROR_CODES}: the
 * rule lives here so every tier enforces the same one, and `apps/web` maps the code to a translated
 * message instead of restating the rule.
 */
function findPhoneNumberError(value: string): null | PhoneNumberErrorCode {
  if (!PHONE_NUMBER_FORMAT.test(value)) {
    return 'INVALID_FORMAT';
  }
  return countPhoneDigits(value) < MIN_PHONE_DIGITS ? 'TOO_FEW_DIGITS' : null;
}

export const $PhoneNumber = z.string().check((ctx) => {
  const code = findPhoneNumberError(ctx.value);
  if (code) {
    ctx.issues.push({ code: 'custom', input: ctx.value, message: PHONE_NUMBER_ERROR_MESSAGES[code] });
  }
});

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
  // Not `$PhoneNumber`: this is the read model, which must still parse numbers stored before the
  // digit minimum existed. The rule is enforced on the write schemas below.
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
    phoneNumber: $PhoneNumber.optional(),
    sex: $Sex.optional()
  });

/** Optional contact details are nullable here, and only here, so an update can clear one. */
export type UpdateUserData = z.infer<typeof $UpdateUserData>;
export const $UpdateUserData = $CreateUserData.partial().extend({
  additionalPermissions: $Permissions.optional(),
  email: z.email().nullish(),
  phoneNumber: $PhoneNumber.nullish()
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

export { findPhoneNumberError, MIN_PHONE_DIGITS };
export type { PhoneNumberErrorCode };
