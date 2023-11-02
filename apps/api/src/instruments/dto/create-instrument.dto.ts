import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import type { InstrumentSource } from '@open-data-capture/common/instrument';
import { instrumentSourceSchema } from '@open-data-capture/common/instrument';

@ValidationSchema<InstrumentSource>(instrumentSourceSchema)
export class CreateInstrumentDto {
  source: string;
}
