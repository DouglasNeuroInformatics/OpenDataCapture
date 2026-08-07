/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable @typescript-eslint/no-namespace */

import type { Theme } from '@douglasneuroinformatics/libui/hooks';
import type { Language } from '@douglasneuroinformatics/libui/i18n';
import type { AnyUnilingualInstrument, Json, RuntimeNotification } from '@opendatacapture/runtime-core';
import type { Language as InterfaceLanguage } from '@opendatacapture/schemas/core';
import type { Subject } from '@opendatacapture/schemas/subject';

/**
 * Turns on exactly the languages `@opendatacapture/schemas` declares. Every frontend imports this
 * package, and a module augmentation applies program-wide, so this one declaration is what makes
 * libui's `Language` — and therefore `useTranslation` — agree with the rest of the application.
 * Extending rather than listing the languages is what stops the two sets drifting apart.
 */
declare module '@douglasneuroinformatics/libui/i18n' {
  export namespace UserConfig {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- the members come from the extends clause, which is the point
    export interface LanguageOptions extends Record<InterfaceLanguage, true> {}
  }
}

declare global {
  interface GlobalEventHandlersEventMap {
    addNotification: CustomEvent<RuntimeNotification>;
    changeLanguage: CustomEvent<Language>;
    changeTheme: CustomEvent<Theme>;
    done: CustomEvent<Json>;
  }
}

export type InterpretedInstrumentState<T extends AnyUnilingualInstrument = AnyUnilingualInstrument> =
  | { error: Error; status: 'ERROR' }
  | { instrument: T; status: 'DONE' }
  | { status: 'LOADING' };

/** A localizable string: per-language text that a component resolves with `t()` to the active language. */
export type LocalizedText = {
  [L in Language]: string;
};

export type SubjectDisplayInfo = Pick<Subject, 'dateOfBirth' | 'firstName' | 'id' | 'lastName' | 'sex'>;
