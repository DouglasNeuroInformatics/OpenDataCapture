import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import { $CreateInstrumentData } from '@open-data-capture/common/instrument';
import type { InstrumentKind } from '@open-data-capture/database/core';

@ValidationSchema($CreateInstrumentData)
export class CreateInstrumentDto<TKind extends InstrumentKind = InstrumentKind> {
  kind?: TKind;
  source: string;
}
