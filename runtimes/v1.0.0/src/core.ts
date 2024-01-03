import type { FormDataType } from '@douglasneuroinformatics/form-types';
import type { Json } from '@open-data-capture/common/core';
import type {
  InstrumentKind,
  InstrumentLanguage,
  InteractiveInstrument,
  StrictFormInstrument
} from '@open-data-capture/common/instrument';

type DiscriminatedInstrumentData<TKind extends InstrumentKind> = [TKind] extends ['form']
  ? FormDataType
  : [TKind] extends ['interactive']
    ? Json
    : never;

type DiscriminatedInstrument<
  TKind extends InstrumentKind,
  TData extends DiscriminatedInstrumentData<TKind>,
  TLanguage extends InstrumentLanguage
> = [TKind] extends ['form']
  ? TData extends FormDataType
    ? StrictFormInstrument<TData, TLanguage>
    : never
  : [TKind] extends ['interactive']
    ? TData extends Json
      ? InteractiveInstrument<TData, TLanguage>
      : never
    : never;

type InstrumentDef<
  TKind extends InstrumentKind,
  TData extends DiscriminatedInstrumentData<TKind>,
  TLanguage extends InstrumentLanguage
> = Omit<DiscriminatedInstrument<TKind, TData, TLanguage>, 'kind' | 'language'>;

export class InstrumentFactory<TKind extends InstrumentKind, TLanguage extends InstrumentLanguage> {
  constructor(private options: { kind: TKind; language: TLanguage }) {}

  createInstrument<TData extends DiscriminatedInstrumentData<TKind>>(def: InstrumentDef<TKind, TData, TLanguage>) {
    return { ...this.options, ...def };
  }
}
