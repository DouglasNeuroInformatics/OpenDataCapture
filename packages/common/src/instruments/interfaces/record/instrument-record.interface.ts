import { Group } from '../../../groups';
import { Subject } from '../../../subjects';
import { BaseInstrument, InstrumentKind } from '../base/base-instrument.interface';
import { FormInstrumentData } from '../form/form-fields.types';
import { FormInstrument } from '../form/form-instrument.types';

export interface InstrumentRecord<TInstrument extends BaseInstrument, TData = any> {
  kind: InstrumentKind;
  dateCollected: Date;
  instrument: TInstrument;
  group?: Group;
  subject: Subject;
  data: TData;
}

export type FormInstrumentRecord<T extends FormInstrumentData = FormInstrumentData> = InstrumentRecord<
  FormInstrument<T>,
  T
>;
