import { ValidationSchema } from '@douglasneuroinformatics/libnest/core';
import type { InstrumentKind } from '@opendatacapture/schemas/instrument';
import { $InstrumentKind } from '@opendatacapture/schemas/instrument';
import { z } from 'zod';

@ValidationSchema(
  z.object({
    bundle: z.string(),
    kind: $InstrumentKind.optional()
  })
)
export class CreateInstrumentFromBundleDto<TKind extends InstrumentKind = InstrumentKind> {
  bundle: string;
  kind?: TKind;
}
