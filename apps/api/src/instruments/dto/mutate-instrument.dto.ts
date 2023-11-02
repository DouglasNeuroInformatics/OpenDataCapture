import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import { instrumentSourceSchema } from '@open-data-capture/common/instrument';

@ValidationSchema(instrumentSourceSchema)
export class MutateInstrumentDto {
  source: string;
}
