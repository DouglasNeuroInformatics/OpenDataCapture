import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import type { Json } from '@open-data-capture/common/core';
import { $CreateInstrumentRecordData } from '@open-data-capture/common/instrument-records';

@ValidationSchema($CreateInstrumentRecordData)
export class CreateInstrumentRecordDto {
  data: Json;
  date: Date;
  groupId?: string;
  instrumentId: string;
  subjectIdentifier: string;
}
