import { ValidationSchema } from '@douglasneuroinformatics/libnest';
import type { Json } from '@opendatacapture/schemas/core';
import { $CreateInstrumentRecordData } from '@opendatacapture/schemas/instrument-records';

@ValidationSchema($CreateInstrumentRecordData)
export class CreateInstrumentRecordDto {
  data: Json;
  date: Date;
  groupId?: string;
  instrumentId: string;
  sessionId: string;
  subjectId: string;
}
