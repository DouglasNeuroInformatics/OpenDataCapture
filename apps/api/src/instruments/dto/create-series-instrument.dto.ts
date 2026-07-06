import { ValidationSchema } from '@douglasneuroinformatics/libnest';
import type { ScalarInstrumentInternal } from '@opendatacapture/runtime-core';
import { $CreateSeriesInstrumentData } from '@opendatacapture/schemas/instrument';

@ValidationSchema($CreateSeriesInstrumentData)
export class CreateSeriesInstrumentDto {
  confirmDuplicate?: boolean;
  description?: string;
  instructions?: string;
  items: ScalarInstrumentInternal[];
  title: string;
}
