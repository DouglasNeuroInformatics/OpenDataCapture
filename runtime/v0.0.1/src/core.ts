import type {
  DiscriminatedInstrument,
  DiscriminatedInstrumentData,
  InstrumentKind,
  InstrumentLanguage,
  InteractiveInstrument,
  StrictFormInstrument
} from '@open-data-capture/common/instrument';

type InstrumentDef<
  TKind extends InstrumentKind,
  TData extends DiscriminatedInstrumentData<TKind>,
  TLanguage extends InstrumentLanguage
> = Omit<DiscriminatedInstrument<TKind, TData, TLanguage>, 'kind' | 'language'>;

export class InstrumentFactory<TKind extends InstrumentKind, TLanguage extends InstrumentLanguage> {
  constructor(private options: { kind: TKind; language: TLanguage }) {}

  defineInstrument<TData extends DiscriminatedInstrumentData<TKind>>(def: InstrumentDef<TKind, TData, TLanguage>) {
    return { ...this.options, ...def };
  }
}

export type { InstrumentKind, InstrumentLanguage, InteractiveInstrument, StrictFormInstrument };
