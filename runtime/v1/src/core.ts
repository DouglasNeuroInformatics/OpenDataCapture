import type { Json, Language } from '@open-data-capture/schemas/core';
import type {
  FormDataType,
  FormInstrument,
  InstrumentKind,
  InstrumentLanguage,
  InteractiveInstrument,
  StrictFormInstrument
} from '@open-data-capture/schemas/instrument';

import { z } from './zod';

export type DiscriminatedInstrumentData<TKind extends InstrumentKind> = [TKind] extends ['FORM']
  ? FormDataType
  : [TKind] extends ['INTERACTIVE']
    ? Json
    : never;

export type DiscriminatedInstrument<
  TKind extends InstrumentKind,
  TData extends DiscriminatedInstrumentData<TKind>,
  TLanguage extends InstrumentLanguage,
  TOptions extends { strict: boolean } = { strict: false }
> = [TKind] extends ['FORM']
  ? TData extends FormDataType
    ? TOptions['strict'] extends true
      ? StrictFormInstrument<TData, TLanguage>
      : FormInstrument<TData, TLanguage>
    : never
  : [TKind] extends ['INTERACTIVE']
    ? TData extends Json
      ? TLanguage extends Language
        ? InteractiveInstrument<TData>
        : never
      : never
    : never;

export type InstrumentDef<
  TKind extends InstrumentKind,
  TData extends DiscriminatedInstrumentData<TKind>,
  TLanguage extends InstrumentLanguage
> = Omit<DiscriminatedInstrument<TKind, TData, TLanguage, { strict: true }>, 'kind' | 'language' | 'validationSchema'>;

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
