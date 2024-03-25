import { ValidationSchema } from '@douglasneuroinformatics/libnest/core';
import type { Json } from '@open-data-capture/schemas/core';
import { $CreateInstrumentRecordData } from '@open-data-capture/schemas/instrument-records';

@ValidationSchema($CreateInstrumentRecordData)
export class CreateInstrumentRecordDto {
  data: Json;
  date: Date;
  groupId?: string;
  instrumentId: string;
  subjectId: string;
}
