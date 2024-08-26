import type { AnyUnilingualInstrument, Json } from '@opendatacapture/runtime-core';
import type { Subject } from '@opendatacapture/schemas/subject';
import type { Promisable } from 'type-fest';

export type InterpretedInstrumentState<T extends AnyUnilingualInstrument = AnyUnilingualInstrument> =
  | { error: Error; status: 'ERROR' }
  | { instrument: T; status: 'DONE' }
  | { status: 'LOADING' };

export type SubjectDisplayInfo = Pick<Subject, 'dateOfBirth' | 'firstName' | 'id' | 'lastName' | 'sex'>;

export type InstrumentSubmitHandler = (arg0: { data: Json; instrumentId: string }) => Promisable<void>;
