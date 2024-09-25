import type { InstrumentKind, InstrumentMeasureValue } from '@opendatacapture/runtime-core';
import { z } from 'zod';

import { $BaseModel, $Json } from '../core/core.js';
import { $InstrumentMeasureValue } from '../instrument/instrument.js';

import type { SessionType } from '../session/session.js';

export const $CreateInstrumentRecordData = z.object({
  assignmentId: z.string().optional(),
  data: $Json,
  date: z.coerce.date(),
  groupId: z.string().optional(),
  instrumentId: z.string(),
  sessionId: z.string(),
  subjectId: z.string()
});

export const $UploadInstrumentRecordData = z.array(
  z.object({
    data: $Json,
    date: z.coerce.date(),
    groupId: z.string().optional(),
    instrumentId: z.string(),
    subjectId: z.string()
  })
);

export type CreateInstrumentRecordData = z.infer<typeof $CreateInstrumentRecordData>;

export type UploadInstrumentRecordData = z.infer<typeof $UploadInstrumentRecordData>;

export const $InstrumentRecord = $BaseModel.extend({
  assignmentId: z.string().nullish(),
  computedMeasures: z.record($InstrumentMeasureValue).nullish(),
  data: z.unknown(),
  date: z.coerce.date(),
  groupId: z.string().nullish(),
  instrumentId: z.string(),
  subjectId: z.string()
});

export type InstrumentRecord = z.infer<typeof $InstrumentRecord>;

export type InstrumentRecordsExport = {
  instrumentEdition: number;
  instrumentName: string;
  measure: string;
  sessionDate: string;
  sessionId: string;
  sessionType: SessionType;
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
