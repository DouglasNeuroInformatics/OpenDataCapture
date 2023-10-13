import { FormDataType } from '@douglasneuroinformatics/form-types';

import { Group } from './group';
import { BaseInstrument, FormInstrument, InstrumentKind } from './instrument';
import { Subject } from './subject';

export type InstrumentRecord<TInstrument extends BaseInstrument, TData = unknown> = {
  data: TData;
  group?: Group;
  instrument: TInstrument;
  kind: InstrumentKind;
  subject: Subject;
  time: number;
};

export type FormInstrumentRecord<T extends FormDataType = FormDataType> = InstrumentRecord<FormInstrument<T>, T>;

/** An object containing all of the records for a given form and subject */
export type SubjectFormRecords<TData extends FormDataType = FormDataType> = {
  instrument: FormInstrument<TData> & {
    identifier: string;
  };
  records: (Pick<FormInstrumentRecord<TData>, 'data' | 'time'> & {
    computedMeasures?: Record<string, number>;
  })[];
};

export type InstrumentRecordsExport = {
  instrumentName: string;
  instrumentVersion: number;
  measure: string;
  subjectAge: number;
  subjectId: string;
  subjectSex: string;
  timestamp: string;
  value: unknown;
}[];

export type FormInstrumentRecordsSummary = {
  centralTendency?: Record<
    string,
    {
      mean: number;
      std: number;
    }
  >;
  count: number;
};
