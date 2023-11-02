import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import type { BaseInstrument } from '@open-data-capture/common/instrument';
import { baseInstrumentSchema, evaluateInstrument, instrumentSourceSchema } from '@open-data-capture/common/instrument';

import { generateBundle } from '../instruments.utils';

const mutateInstrumentDataSchema = instrumentSourceSchema
  .transform(({ source }) => {
    const bundle = generateBundle(source);
    const instance = evaluateInstrument(bundle);
    return {
      bundle,
      instance,
      source
    };
  })
  .refine(({ instance }) => {
    return baseInstrumentSchema.safeParse(instance).success;
  });

@ValidationSchema(mutateInstrumentDataSchema)
export class MutateInstrumentDto {
  bundle: string;
  instance: BaseInstrument;
  source: string;
}
