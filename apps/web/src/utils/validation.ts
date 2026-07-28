import type { TranslateFunction, TranslationKey } from '@douglasneuroinformatics/libui/i18n';
import { findPhoneNumberError, MIN_PHONE_DIGITS } from '@opendatacapture/schemas/user';
import type { PhoneNumberErrorCode } from '@opendatacapture/schemas/user';
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

function $Email(t: TranslateFunction<TranslationKey>) {
  return blankOr((value) =>
    z.email().safeParse(value).success ? null : t({ en: 'Invalid email address', fr: 'Adresse courriel invalide' })
  );
}

function $PhoneNumber(t: TranslateFunction<TranslationKey>) {
  const messages: { [K in PhoneNumberErrorCode]: string } = {
    INVALID_FORMAT: t({ en: 'Invalid phone number', fr: 'Numéro de téléphone invalide' }),
    TOO_FEW_DIGITS: t({
      en: `Phone number must contain at least ${MIN_PHONE_DIGITS} digits`,
      fr: `Le numéro de téléphone doit contenir au moins ${MIN_PHONE_DIGITS} chiffres`
    })
  };
  return blankOr((value) => {
    const code = findPhoneNumberError(value);
    return code ? messages[code] : null;
  });
}

export { $Email, $PhoneNumber, clearedIfBlank, omittedIfBlank };
