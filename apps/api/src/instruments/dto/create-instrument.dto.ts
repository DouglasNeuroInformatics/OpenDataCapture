import { ValidationSchema } from '@douglasneuroinformatics/libnest';
import { $CreateInstrumentData } from '@opendatacapture/schemas/instrument';

@ValidationSchema($CreateInstrumentData)
export class CreateInstrumentDto {
  bundle: string;
}
