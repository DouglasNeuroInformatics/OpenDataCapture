import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import type { CreateInstrumentRecordData } from '@open-data-capture/common/instrument-records';
import { createInstrumentRecordDataSchema } from '@open-data-capture/common/instrument-records';

@ValidationSchema<CreateInstrumentRecordData>(createInstrumentRecordDataSchema)
export class CreateInstrumentRecordDto {
  data: unknown;
  date: Date;
  groupId: string;
  instrumentId: string;
  subjectIdentifier: string;
}
