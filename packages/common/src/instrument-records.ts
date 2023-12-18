import type { FormDataType } from '@douglasneuroinformatics/form-types';
import { z } from 'zod';

import { $Json } from './core';

import type { Group } from './group';
import type { BaseInstrument, FormInstrument } from './instrument';
import type { Subject } from './subject';

export const $CreateInstrumentRecordData = z.object({
  assignmentId: z.string().optional(),
  data: $Json,
  date: z.coerce.date(),
  groupId: z.string().optional(),
  instrumentId: z.string(),
  subjectIdentifier: z.string()
});

export type CreateInstrumentRecordData = z.infer<typeof $CreateInstrumentRecordData>;

export type InstrumentRecord<TData = unknown, TInstrument extends BaseInstrument<TData> = BaseInstrument<TData>> = {
  data: TData;
  date: Date;
  group?: Group;
  instrument: TInstrument;
  subject: Subject;
};

export type FormInstrumentRecord<TData extends FormDataType = FormDataType> = InstrumentRecord<
  TData,
  FormInstrument<TData>
> & {
  computedMeasures?: Record<string, number>;
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

export type LinearRegressionResults = Record<string, { intercept: number; slope: number; stdErr: number }>;
