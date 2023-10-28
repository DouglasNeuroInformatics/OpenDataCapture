import type { FormDataType } from '@douglasneuroinformatics/form-types';

import type { Group } from '../group/group.types';
import type { BaseInstrumentType, FormInstrumentType, InstrumentKind } from '../instrument/instrument.types';
import type { Subject } from '../subject/subject.types';

export type InstrumentRecord<TInstrument extends BaseInstrumentType = BaseInstrumentType, TData = unknown> = {
  data: TData;
  group?: Group;
  instrument: TInstrument;
  kind: InstrumentKind;
  subject: Subject;
  time: number;
};

export type FormInstrumentRecord<T extends FormDataType = FormDataType> = InstrumentRecord<FormInstrumentType<T>, T>;

/** An object containing all of the records for a given form and subject */
export type SubjectFormRecords<TData extends FormDataType = FormDataType> = {
  instrument: FormInstrumentType<TData> & {
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
