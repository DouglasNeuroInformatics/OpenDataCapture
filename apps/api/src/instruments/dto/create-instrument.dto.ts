import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import { $CreateInstrumentData } from '@open-data-capture/common/instrument';

@ValidationSchema($CreateInstrumentData)
export class CreateInstrumentDto {
  source: string;
}
