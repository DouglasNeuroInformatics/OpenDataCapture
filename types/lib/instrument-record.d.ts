import { FormInstrumentData } from '@douglasneuroinformatics/form-types';

import { BaseInstrument, FormInstrument, InstrumentKind } from './instrument';
import { Group } from './group';
import { Subject } from './subject';

export type InstrumentRecord<TInstrument extends BaseInstrument, TData = unknown> = {
  kind: InstrumentKind;
  time: number;
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
    Pick<FormInstrumentRecord<TData>, 'data' | 'time'> & {
      computedMeasures?: Record<string, number>;
    }
  >;
};

export type InstrumentRecordsExport = Array<{
  subjectId: string;
  subjectAge: number;
  subjectSex: string;
  instrumentName: string;
  instrumentVersion: number;
  timestamp: string;
  measure: string;
  value: any;
}>;

export type FormInstrumentRecordsSummary = {
  count: number;
  centralTendency?: {
    // Measures
    [key: string]: {
      mean: number;
      std: number;
    };
  };
};
