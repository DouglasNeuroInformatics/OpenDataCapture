import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import type { CreateInstrumentRecordData } from '@open-data-capture/common/instrument-records';
import { createInstrumentRecordDataSchema } from '@open-data-capture/common/instrument-records';
import type { Jsonifiable } from 'type-fest';

@ValidationSchema<CreateInstrumentRecordData>(createInstrumentRecordDataSchema)
export class CreateInstrumentRecordDto {
  data: Jsonifiable;
  date: Date;
  groupId?: string;
  instrumentId: string;
  subjectIdentifier: string;
}
