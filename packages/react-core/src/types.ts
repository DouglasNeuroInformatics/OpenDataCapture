/* eslint-disable @typescript-eslint/consistent-type-definitions */

import type { Theme } from '@douglasneuroinformatics/libui/hooks';
import type { Language } from '@douglasneuroinformatics/libui/i18n';
import type { AnyUnilingualInstrument, Json } from '@opendatacapture/runtime-core';
import type { Subject } from '@opendatacapture/schemas/subject';
import type { Promisable } from 'type-fest';

declare global {
  interface GlobalEventHandlersEventMap {
    changeLanguage: CustomEvent<Language>;
    changeTheme: CustomEvent<Theme>;
    done: CustomEvent<Json>;
  }
}

export type InterpretedInstrumentState<T extends AnyUnilingualInstrument = AnyUnilingualInstrument> =
  | { error: Error; status: 'ERROR' }
  | { instrument: T; status: 'DONE' }
  | { status: 'LOADING' };

export type SubjectDisplayInfo = Pick<Subject, 'dateOfBirth' | 'firstName' | 'id' | 'lastName' | 'sex'>;

export type InstrumentSubmitHandler = (
  arg0:
    | { data: Json; index: number; instrumentId: string; kind: 'SERIES' }
    | { data: Json; instrumentId: string; kind?: 'SCALAR' }
) => Promisable<void>;
