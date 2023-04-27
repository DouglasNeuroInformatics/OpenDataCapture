import { BaseInstrument, InstrumentKind } from '../base/base-instrument.interface';
import { FormInstrumentData } from '../form/form-fields.types';
import { FormInstrument } from '../form/form-instrument.types';

import { Group } from '@/groups';
import { Subject } from '@/subjects';

export type InstrumentRecord<TInstrument extends BaseInstrument, TData = unknown> = {
  kind: InstrumentKind;
  dateCollected: Date;
  instrument: TInstrument;
  group?: Group;
  subject: Subject;
  data: TData;
};

export type FormInstrumentRecord<T extends FormInstrumentData = FormInstrumentData> = InstrumentRecord<
  FormInstrument<T>,
  T
>;

/** An object containing all of the records for a given form and subject */
export type SubjectFormRecords<TData extends FormInstrumentData = FormInstrumentData> = {
  instrument: FormInstrument<TData> & {
    identifier: string;
  };
  records: Array<
    Pick<FormInstrumentRecord<TData>, 'data' | 'dateCollected'> & {
      computedMeasures?: Record<string, number>;
    }
  >;
};
