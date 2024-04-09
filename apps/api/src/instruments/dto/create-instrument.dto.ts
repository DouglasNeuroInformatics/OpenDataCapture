import { ValidationSchema } from '@douglasneuroinformatics/libnest/core';
import type { InstrumentKind } from '@opendatacapture/database/core';
import { $CreateInstrumentData } from '@opendatacapture/schemas/instrument';

@ValidationSchema($CreateInstrumentData)
export class CreateInstrumentDto<TKind extends InstrumentKind = InstrumentKind> {
  kind?: TKind;
  source: string;
}
