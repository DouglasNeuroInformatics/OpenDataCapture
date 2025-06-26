import type { InstrumentKind, InstrumentMeasureValue } from '@opendatacapture/runtime-core';
import { z } from 'zod/v4';

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

export const $UploadInstrumentRecordsData = z.object({
  groupId: z.string().optional(),
  instrumentId: z.string(),
  records: z.array(
    z.object({
      data: $Json,
      date: z.coerce.date(),
      subjectId: z.string()
    })
  )
});

export type CreateInstrumentRecordData = z.infer<typeof $CreateInstrumentRecordData>;

export type UploadInstrumentRecordsData = z.infer<typeof $UploadInstrumentRecordsData>;

export const $InstrumentRecord = $BaseModel.extend({
  assignmentId: z.string().nullish(),
  computedMeasures: z.record(z.string(), $InstrumentMeasureValue).nullish(),
  data: z.unknown(),
  date: z.coerce.date(),
  groupId: z.string().nullish(),
  instrumentId: z.string(),
  subjectId: z.string()
});

export type InstrumentRecord = z.infer<typeof $InstrumentRecord>;

export type InstrumentRecordsExport = {
  groupId: string;
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
  z.string(),
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
