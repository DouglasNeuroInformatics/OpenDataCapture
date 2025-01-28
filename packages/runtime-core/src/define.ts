import type { z } from 'zod';

import type { InstrumentKind, InstrumentLanguage } from './types/instrument.base.js';
import type { FormInstrument } from './types/instrument.form.js';
import type { InteractiveInstrument } from './types/instrument.interactive.js';

/** @public */
// prettier-ignore
export type DiscriminatedInstrument<
  TKind extends InstrumentKind,
  TLanguage extends InstrumentLanguage,
  TData
> = [TKind] extends ['FORM']
  ? TData extends FormInstrument.Data
    ? FormInstrument<TData, TLanguage>
    : never
  : [TKind] extends ['INTERACTIVE']
    ? TData extends InteractiveInstrument.Data
      ? InteractiveInstrument<TData, TLanguage>
      : never
    : never;

/** @public */
export type InstrumentDef<
  TKind extends InstrumentKind,
  TLanguage extends InstrumentLanguage,
  TSchema extends z.ZodTypeAny
> = Omit<
  DiscriminatedInstrument<TKind, TLanguage, z.TypeOf<TSchema>>,
  '__runtimeVersion' | 'kind' | 'language' | 'validationSchema'
> & {
  kind: TKind;
  language: TLanguage;
  validationSchema: TSchema;
};

/** @public */
export function defineInstrument<
  TKind extends InstrumentKind,
  TLanguage extends InstrumentLanguage,
  TSchema extends z.ZodTypeAny
>(def: InstrumentDef<TKind, TLanguage, TSchema>) {
  return Object.assign(def, {
    __runtimeVersion: 1
  }) as unknown as DiscriminatedInstrument<TKind, TLanguage, z.TypeOf<TSchema>>;
}
