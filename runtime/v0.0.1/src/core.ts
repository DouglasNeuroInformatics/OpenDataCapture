import type {
  DiscriminatedInstrumentData,
  InstrumentDef,
  InstrumentKind,
  InstrumentLanguage,
  InteractiveInstrument,
  StrictFormInstrument
} from '@open-data-capture/common/instrument';

export class InstrumentFactory<TKind extends InstrumentKind, TLanguage extends InstrumentLanguage> {
  constructor(private options: { kind: TKind; language: TLanguage }) {}

  defineInstrument<TData extends DiscriminatedInstrumentData<TKind>>(def: InstrumentDef<TKind, TData, TLanguage>) {
    return { ...this.options, ...def };
  }
}

export type { InstrumentKind, InstrumentLanguage, InteractiveInstrument, StrictFormInstrument };
