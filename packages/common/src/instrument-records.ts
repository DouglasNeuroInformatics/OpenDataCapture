import { z } from 'zod';

import { $BaseModel, $Json } from './core';
import { $InstrumentKind, type InstrumentKind } from './instrument';

export const $CreateInstrumentRecordData = z.object({
  assignmentId: z.string().optional(),
  data: $Json,
  date: z.coerce.date(),
  groupId: z.string().optional(),
  instrumentId: z.string(),
  subjectId: z.string()
});

export type CreateInstrumentRecordData = z.infer<typeof $CreateInstrumentRecordData>;

export const $InstrumentRecord = $BaseModel.extend({
  assignmentId: z.string().nullish(),
  computedMeasures: z.record(z.number()).optional(),
  data: z.unknown(),
  date: z.coerce.date(),
  groupId: z.string().nullish(),
  instrument: z.object({
    kind: $InstrumentKind
  }),
  instrumentId: z.string(),
  subjectId: z.string()
});

export type InstrumentRecord = z.infer<typeof $InstrumentRecord>;

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

export type InstrumentRecordQueryParams = {
  groupId?: string;
  instrumentId?: string;
  kind?: InstrumentKind;
  minDate?: Date;
  subjectId?: string;
};
