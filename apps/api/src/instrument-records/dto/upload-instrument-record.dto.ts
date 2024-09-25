import { ValidationSchema } from '@douglasneuroinformatics/libnest/core';
import type { Json } from '@opendatacapture/schemas/core';
import { $UploadInstrumentRecordData } from '@opendatacapture/schemas/instrument-records';

@ValidationSchema($UploadInstrumentRecordData)
export class UploadInstrumentRecordDto {
  data: Json;
  date: Date;
  groupId?: string;
  instrumentId: string;
  subjectId: string;
}
