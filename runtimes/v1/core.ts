import type { InstrumentDef, InstrumentLanguage } from '@open-data-capture/common/instrument';

export function defineInstrument<TData, TLanguage extends InstrumentLanguage>(def: InstrumentDef<TData, TLanguage>) {
  return def;
}
