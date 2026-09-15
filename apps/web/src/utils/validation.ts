import type { ZodErrorLike } from '@douglasneuroinformatics/libjs';
import type { TranslateFunction, TranslationKey } from '@douglasneuroinformatics/libui/i18n';
import { findPhoneNumberError, MIN_PHONE_DIGITS } from '@opendatacapture/schemas/user';
import type { BasePermissionLevel, PhoneNumberErrorCode } from '@opendatacapture/schemas/user';
import { z } from 'zod/v4';

/**
 * A field that may be left blank, and is otherwise rejected with the message `findError` returns.
 * This is one string schema rather than a union with `z.literal('')` because zod discards the
 * issues raised inside a union member, reporting an untranslated `invalid_union` error instead.
 */
function blankOr(findError: (value: string) => null | string) {
  return z.string().check((ctx) => {
    const message = ctx.value === '' ? null : findError(ctx.value);
    if (message) {
      ctx.issues.push({ code: 'custom', input: ctx.value, message });
    }
  });
}

/** The update-side counterpart of `blankOr`: a field left blank is cleared, which the API spells null. */
function clearedIfBlank(value: string | undefined) {
  return value === '' ? null : value;
}

/** The create-side counterpart of `blankOr`: a create has nothing to clear, so a blank field is simply absent. */
function omittedIfBlank(value: string | undefined) {
  return value === '' ? undefined : value;
}

/**
 * A PATCH carries only what changed, so a value the user never touched is never re-validated by the
 * write schema. That matters for a number stored before the digit minimum existed: `$User` still
 * parses it so the form can show it, but `$UpdateUserData` would reject it on the way back out and
 * block every other field on the form with it.
 */
function omittedIfUnchanged(value: string | undefined, storedValue: null | string | undefined) {
  return (value ?? '') === (storedValue ?? '') ? undefined : clearedIfBlank(value);
}

function $Email(t: TranslateFunction<TranslationKey>) {
  return blankOr((value) =>
    z.email().safeParse(value).success ? null : t({ en: 'Invalid email address', fr: 'Adresse courriel invalide' })
  );
}

/**
 * `storedValue` is the number already on the record, which is accepted as-is: one stored before the
 * digit minimum existed would otherwise fail here and leave the rest of the form unsubmittable.
 * Pair it with `omittedIfUnchanged` so the value the schema waved through is not then sent.
 */
function $PhoneNumber(t: TranslateFunction<TranslationKey>, storedValue?: null | string) {
  const messages: { [K in PhoneNumberErrorCode]: string } = {
    INVALID_FORMAT: t({ en: 'Invalid phone number', fr: 'Numéro de téléphone invalide' }),
    TOO_FEW_DIGITS: t({
      en: `Phone number must contain at least ${MIN_PHONE_DIGITS} digits`,
      fr: `Le numéro de téléphone doit contenir au moins ${MIN_PHONE_DIGITS} chiffres`
    })
  };
  return blankOr((value) => {
    if (value === storedValue) {
      return null;
    }
    const code = findPhoneNumberError(value);
    return code ? messages[code] : null;
  });
}

/**
 * Whether this user must belong to at least one group, shared by the create and update forms so the
 * two cannot drift apart again.
 *
 * A disabled account exists only to attribute uploaded data, so it never needs one. Every other
 * non-admin does: each read rule granted to a non-admin is scoped to the groups they belong to, so a
 * groupless user can still create records that no group manager can ever read back. A null
 * permission level is not an admin, and so counts.
 */
function requiresGroup({
  basePermissionLevel,
  disabled
}: {
  basePermissionLevel?: BasePermissionLevel | null;
  disabled?: boolean | null;
}) {
  return basePermissionLevel !== 'ADMIN' && !disabled;
}

/**
 * What to tell the user about a submit their form data never passed. Messages are deduplicated
 * because the common failure — several blank required fields — otherwise repeats one sentence once
 * per field.
 */
function validationSummary({ issues }: ZodErrorLike) {
  return Array.from(new Set(issues.map((issue) => issue.message))).join(' ');
}

export { $Email, $PhoneNumber, clearedIfBlank, omittedIfBlank, omittedIfUnchanged, requiresGroup, validationSummary };
