import { ValidationSchema } from '@douglasneuroinformatics/libnest/core';
import type { BundlerInput } from '@opendatacapture/instrument-bundler';
import type { InstrumentKind } from '@opendatacapture/schemas/instrument';
import { $CreateInstrumentData } from '@opendatacapture/schemas/instrument';

@ValidationSchema($CreateInstrumentData)
export class CreateInstrumentDto<TKind extends InstrumentKind = InstrumentKind> {
  inputs: BundlerInput[];
  kind?: TKind;
}
