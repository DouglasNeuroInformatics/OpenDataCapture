import { ValidationSchema } from '@douglasneuroinformatics/libnest/core';
import type { InstrumentKind } from '@open-data-capture/database/core';
import { $CreateInstrumentData } from '@open-data-capture/schemas/instrument';

@ValidationSchema($CreateInstrumentData)
export class CreateInstrumentDto<TKind extends InstrumentKind = InstrumentKind> {
  kind?: TKind;
  source: string;
}
