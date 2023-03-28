import { Group } from '../../groups';
import { Subject } from '../../subjects';
import { InstrumentKind } from '../enums/instrument-kind.enum';

import { BaseInstrument } from './base-instrument.interface';
import { FormInstrument, FormInstrumentData } from './form-instrument.interface';

export interface InstrumentRecord<TInstrument extends BaseInstrument, TData = any> {
  kind: InstrumentKind;
  dateCollected: Date;
  instrument: TInstrument;
  group: Group;
  subject: Subject;
  data: TData;
}

export type FormInstrumentRecord = InstrumentRecord<FormInstrument, FormInstrumentData>;
