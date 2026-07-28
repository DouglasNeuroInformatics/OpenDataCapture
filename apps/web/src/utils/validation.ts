import type { TranslateFunction, TranslationKey } from '@douglasneuroinformatics/libui/i18n';
import { z } from 'zod/v4';

const PHONE_REGEX = new RegExp(/^\+?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,9}$/);

const MIN_PHONE_DIGITS = 7;

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

function countPhoneDigits(phone: string): number {
  return phone.replace(/\D/g, '').length;
}

/** The submit-side counterpart of `blankOr`: a field left blank is cleared, which the API spells null. */
function clearedIfBlank(value: string | undefined) {
  return value === '' ? null : value;
}

function $Email(t: TranslateFunction<TranslationKey>) {
  return blankOr((value) =>
    z.email().safeParse(value).success ? null : t({ en: 'Invalid email address', fr: 'Adresse courriel invalide' })
  );
}

function $PhoneNumber(t: TranslateFunction<TranslationKey>) {
  return blankOr((value) => {
    if (!PHONE_REGEX.test(value)) {
      return t({ en: 'Invalid phone number', fr: 'Numéro de téléphone invalide' });
    }
    if (countPhoneDigits(value) < MIN_PHONE_DIGITS) {
      return t({
        en: `Phone number must contain at least ${MIN_PHONE_DIGITS} digits`,
        fr: `Le numéro de téléphone doit contenir au moins ${MIN_PHONE_DIGITS} chiffres`
      });
    }
    return null;
  });
}

export { $Email, $PhoneNumber, clearedIfBlank, countPhoneDigits, MIN_PHONE_DIGITS };
