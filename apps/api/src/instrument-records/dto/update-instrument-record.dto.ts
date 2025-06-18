import { DataTransferObject } from '@douglasneuroinformatics/libnest';
import { z } from 'zod';

export class UpdateInstrumentRecordDto extends DataTransferObject({
  data: z.union([z.record(z.string(), z.any()), z.array(z.any())])
}) {}
