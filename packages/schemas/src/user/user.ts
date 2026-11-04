import { z } from 'zod/v4';

import { $BaseModel, $DateLike, $Permissions, isGrantablePermission } from '../core/core.js';
import { $EmailDeliveryResult } from '../mail/mail.js';
import { $Sex } from '../subject/subject.js';

const MIN_PHONE_DIGITS = 7;

/** The E.164 maximum, country code included. */
const MAX_PHONE_DIGITS = 15;

const PHONE_NUMBER_FORMAT = /^\+?[\d\s().-]+$/;

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
  const digitCount = countPhoneDigits(value);
  if (!PHONE_NUMBER_FORMAT.test(value) || digitCount > MAX_PHONE_DIGITS) {
    return 'INVALID_FORMAT';
  }
  return digitCount < MIN_PHONE_DIGITS ? 'TOO_FEW_DIGITS' : null;
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
  'PASSWORD_IN_DATA_BREACH',
  'PASSWORD_MATCHES_CURRENT'
] as const;

export type PasswordErrorCode = (typeof PASSWORD_ERROR_CODES)[number];

export type User = z.infer<typeof $User>;
export const $User = $BaseModel.extend({
  additionalPermissions: $Permissions,
  archivedAt: $DateLike.nullish(),
  basePermissionLevel: $BasePermissionLevel.nullable(),
  dateOfBirth: $DateLike.nullish(),
  disabled: z.boolean().nullish(),
  email: z.email().nullish(),
  firstName: z.string().min(1),
  groupIds: z.array(z.string()),
  lastName: z.string().min(1),
  /**
   * Whether this user must choose a new password before they may use the app. Set when an
   * administrator generates a password on their behalf, and cleared the moment the user sets one
   * themselves. Nullish because it postdates the users already in the database.
   */
  mustResetPassword: z.boolean().nullish(),
  /**
   * The permission set this user holds, if any. Never alongside custom `additionalPermissions`:
   * {@link $UpdateUserPermissionsData} writes the two together, one of them always empty.
   */
  permissionSetId: z.string().nullish(),
  // Not `$PhoneNumber`: this is the read model, which must still parse numbers stored before the
  // digit minimum existed. The rule is enforced on the write schemas below.
  phoneNumber: z.string().nullish(),
  sex: $Sex.nullish(),
  username: z.string().min(1)
});

/** What `POST /v1/users` returns: the created user, augmented with the outcome of the welcome-email attempt. */
export type CreateUserResponse = z.infer<typeof $CreateUserResponse>;
export const $CreateUserResponse = $User.extend({ welcomeEmail: $EmailDeliveryResult });

/**
 * The account fields an administrator writes, with none of the rules relating one to another. Every
 * user write schema derives from this rather than from another write schema, because deriving from
 * an object drops its `.check` without a word.
 */
export const $BaseUserData = $User
  .pick({
    basePermissionLevel: true,
    firstName: true,
    groupIds: true,
    lastName: true,
    username: true
  })
  .extend({
    dateOfBirth: $DateLike.optional(),
    disabled: z.boolean().optional(),
    email: z.email().optional(),
    mustResetPassword: z.boolean().optional(),
    password: z.string().min(1),
    phoneNumber: $PhoneNumber.optional(),
    sex: $Sex.optional()
  });

export type $CreateUserData = z.infer<typeof $CreateUserData>;
export const $CreateUserData = $BaseUserData
  .extend({
    permissionSetId: z.string().optional()
  })
  .check((ctx) => {
    if (ctx.value.basePermissionLevel === 'ADMIN' && ctx.value.permissionSetId !== undefined) {
      ctx.issues.push({
        code: 'custom',
        input: ctx.value.permissionSetId,
        message: 'Administrators hold every permission, so they cannot hold a permission set',
        path: ['permissionSetId']
      });
    }
  });

/**
 * Optional contact details are nullable here, and only here, so an update can clear one.
 * `additionalPermissions` and `permissionSetId` are deliberately absent: they are written only
 * through {@link $UpdateUserPermissionsData}, whose route is gated more tightly than a profile update.
 */
export type $UpdateUserData = z.infer<typeof $UpdateUserData>;
export const $UpdateUserData = $BaseUserData.partial().extend({
  email: z.email().nullish(),
  phoneNumber: $PhoneNumber.nullish()
});

/**
 * Where a user's permissions beyond their base level come from: a permission set, or their own
 * custom grants. A write replaces both, so a body naming one empties the other and no user can hold
 * the two at once.
 */
export type $UpdateUserPermissionsData = z.infer<typeof $UpdateUserPermissionsData>;
export const $UpdateUserPermissionsData = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('permissionSet'),
    permissionSetId: z.string()
  }),
  z.object({
    kind: z.literal('custom'),
    permissions: $Permissions.check((ctx) => {
      ctx.value.forEach((permission, index) => {
        if (!isGrantablePermission(permission)) {
          ctx.issues.push({
            code: 'custom',
            input: permission,
            message: 'Only an administrator can create, modify or delete users, so this permission would do nothing',
            path: [index]
          });
        }
      });
    })
  })
]);

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
