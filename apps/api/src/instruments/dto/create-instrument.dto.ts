import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import { $InstrumentSourceContainer } from '@open-data-capture/common/instrument';

const $CreateInstrumentData = $InstrumentSourceContainer.pick({ source: true });

@ValidationSchema($CreateInstrumentData)
export class CreateInstrumentDto {
  source: string;
}
