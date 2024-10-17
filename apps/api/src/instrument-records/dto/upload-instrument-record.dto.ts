import { ValidationSchema } from '@douglasneuroinformatics/libnest/core';
import type { Json } from '@opendatacapture/schemas/core';
import { $UploadInstrumentRecordsData } from '@opendatacapture/schemas/instrument-records';

@ValidationSchema($UploadInstrumentRecordsData)
export class UploadInstrumentRecordsDto {
  groupId?: string;
  instrumentId: string;
  records: {
    data: Json;
    date: Date;
    subjectId: string;
  }[];
}
