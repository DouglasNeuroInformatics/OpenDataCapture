import { ValidationSchema } from '@douglasneuroinformatics/libnest/core';
import { $CreateInstrumentData } from '@opendatacapture/schemas/instrument';

@ValidationSchema($CreateInstrumentData)
export class CreateInstrumentDto {
  bundle: string;
}
