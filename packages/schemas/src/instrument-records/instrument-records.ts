import { z } from 'zod';

import { $BaseModel, $Json } from '../core/core.js';
import { $InstrumentKind, $InstrumentMeasureValue } from '../instrument/instrument.js';

import type { InstrumentKind, InstrumentMeasureValue } from '../instrument/instrument.js';

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
  computedMeasures: z.record($InstrumentMeasureValue).optional(),
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
  subjectAge: null | number;
  subjectId: string;
  subjectSex: null | string;
  timestamp: string;
  value: InstrumentMeasureValue;
}[];

export const $LinearRegressionResults = z.record(
  z.object({
    intercept: z.number(),
    slope: z.number(),
    stdErr: z.number()
  })
);

export type LinearRegressionResults = z.infer<typeof $LinearRegressionResults>;

export type InstrumentRecordQueryParams = {
  groupId?: string;
  instrumentId?: string;
  kind?: InstrumentKind;
  minDate?: Date;
  subjectId?: string;
};
