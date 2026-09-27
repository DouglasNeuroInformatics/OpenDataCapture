import React from 'react';

/**
 * A ref for the element wrapping a form that sets, rather than asks for, a password.
 *
 * Browsers ignore `autocomplete="off"` on credential fields — the value libui's `Input` sets — and
 * fill the signed-in administrator's own saved login into any form shaped like a sign-in: the saved
 * password into the password fields, and the saved username into the neighbouring text field.
 * `new-password` is the value password managers honour as "this is not the saved credential", and it
 * also stops the form being read as a sign-in at all, which is what leaves the other fields alone.
 * libui's field configuration exposes no autocomplete option, so the attribute is set here.
 *
 * Attach it to an element that is remounted whenever the form is, so the fresh inputs are covered.
 */
export function useSuppressPasswordAutofill() {
  return React.useCallback((container: HTMLElement | null) => {
    container?.querySelectorAll('input[type="password"]').forEach((input) => {
      input.setAttribute('autocomplete', 'new-password');
    });
  }, []);
}
