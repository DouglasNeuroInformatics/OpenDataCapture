import type {
  DiscriminatedInstrumentData,
  InstrumentDef,
  InstrumentKind,
  InstrumentLanguage,
  InteractiveInstrument,
  StrictFormInstrument
} from '@open-data-capture/common/instrument';

import { z } from './zod';

export class InstrumentFactory<
  TKind extends InstrumentKind,
  TLanguage extends InstrumentLanguage,
  TSchema extends z.ZodType<DiscriminatedInstrumentData<TKind>>
> {
  constructor(private options: { kind: TKind; language: TLanguage; validationSchema: TSchema }) {}

  defineInstrument(def: InstrumentDef<TKind, z.infer<TSchema>, TLanguage>) {
    return { ...this.options, ...def };
  }
}

export type { InstrumentKind, InstrumentLanguage, InteractiveInstrument, StrictFormInstrument };
