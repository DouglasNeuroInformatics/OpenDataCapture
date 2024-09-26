import { ValidationSchema } from '@douglasneuroinformatics/libnest/core';
import type { Json } from '@opendatacapture/schemas/core';
import { $UploadInstrumentRecordData } from '@opendatacapture/schemas/instrument-records';

@ValidationSchema($UploadInstrumentRecordData)
export class UploadInstrumentRecordDto {
  groupId?: string;
  instrumentId: string;
  records: {
    data: Json;
    date: Date;
    subjectId: string;
  }[];
}
