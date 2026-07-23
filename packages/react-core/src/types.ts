/* eslint-disable @typescript-eslint/consistent-type-definitions */

import type { Theme } from '@douglasneuroinformatics/libui/hooks';
import type { Language } from '@douglasneuroinformatics/libui/i18n';
import type { AnyUnilingualInstrument, Json, RuntimeNotification } from '@opendatacapture/runtime-core';
import type { Subject } from '@opendatacapture/schemas/subject';

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
  [L in Language]?: string;
};

export type SubjectDisplayInfo = Pick<Subject, 'dateOfBirth' | 'firstName' | 'id' | 'lastName' | 'sex'>;
