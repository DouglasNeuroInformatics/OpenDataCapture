import type { Json, Language } from '@opendatacapture/schemas/core';
import type {
  FormDataType,
  FormInstrument,
  InstrumentKind,
  InstrumentLanguage,
  InteractiveInstrument,
  StrictFormInstrument
} from '@opendatacapture/schemas/instrument';

import { z } from './zod';

type DiscriminatedInstrumentData<TKind extends InstrumentKind> = [TKind] extends ['FORM']
  ? FormDataType
  : [TKind] extends ['INTERACTIVE']
    ? Json
    : never;

type DiscriminatedInstrument<
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

type InstrumentDef<
  TKind extends InstrumentKind,
  TData extends DiscriminatedInstrumentData<TKind>,
  TLanguage extends InstrumentLanguage
> = Omit<DiscriminatedInstrument<TKind, TData, TLanguage, { strict: true }>, 'kind' | 'language' | 'validationSchema'>;

/** @deprecated use `defineInstrument` */
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

export function defineInstrument<
  TKind extends InstrumentKind,
  TLanguage extends InstrumentLanguage,
  TSchema extends z.ZodType<DiscriminatedInstrumentData<TKind>>
>(
  def: { kind: TKind; language: TLanguage; validationSchema: TSchema } & InstrumentDef<
    TKind,
    z.infer<TSchema>,
    TLanguage
  >
) {
  return def;
}

export type { InstrumentKind, InstrumentLanguage, InteractiveInstrument, StrictFormInstrument };
