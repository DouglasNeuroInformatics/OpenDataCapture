import { ValidationSchema } from '@douglasneuroinformatics/libnest/core';
import type { InstrumentKind } from '@opendatacapture/database/core';
import type { BundlerInput } from '@opendatacapture/instrument-bundler';
import { $CreateInstrumentData } from '@opendatacapture/schemas/instrument';

@ValidationSchema($CreateInstrumentData)
export class CreateInstrumentDto<TKind extends InstrumentKind = InstrumentKind> {
  inputs: BundlerInput[];
  kind?: TKind;
}
