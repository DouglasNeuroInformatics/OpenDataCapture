import React from 'react';

import { generatePassphrase } from '@/utils/passphrase';

/**
 * The two fields a generated passphrase fills. Exported because libui's `FormProps` leaves `TData`
 * uninstantiated in `subscribe.onChange`'s `setValues` parameter, so each caller has to annotate it
 * rather than letting inference supply it.
 */
export type PasswordFormValues = {
  confirmPassword?: string | undefined;
  password?: string | undefined;
};

/**
 * Backs the password field's `generatePassword` control and remembers what it produced.
 *
 * The field writes the returned value into `password` itself; `confirmPassword` is left untouched,
 * so it is filled through the form's `subscribe` prop instead. Remounting the form with fresh
 * `initialValues` would also work, and would discard every other field already filled in.
 */
export function usePasswordGenerator() {
  const [generatedPassword, setGeneratedPassword] = React.useState<null | string>(null);

  /** Pass to the password field's `generatePassword`. Recording the value here is what tracks the click. */
  const generatePassword = () => {
    const password = generatePassphrase();
    setGeneratedPassword(password);
    return password;
  };

  const applyGeneratedPassword = (setValues: React.Dispatch<React.SetStateAction<PasswordFormValues>>) => {
    if (!generatedPassword) {
      return;
    }
    setValues((values) => ({ ...values, confirmPassword: generatedPassword, password: generatedPassword }));
  };

  /**
   * Whether the password about to be submitted is still the one that was generated. Comparing the
   * value rather than only remembering that the control was used means an administrator who types
   * over a generated passphrase has chosen the password themselves, and no forced reset is imposed.
   */
  const isGeneratedPassword = (password: string | undefined) => {
    return generatedPassword !== null && password === generatedPassword;
  };

  return { applyGeneratedPassword, generatedPassword, generatePassword, isGeneratedPassword };
}
