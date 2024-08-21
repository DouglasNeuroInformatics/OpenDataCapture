import type { z } from 'zod';

import type { InstrumentKind, InstrumentLanguage } from './types/instrument.base.d.ts';
import type { FormInstrument } from './types/instrument.form.d.ts';
import type { InteractiveInstrument } from './types/instrument.interactive.d.ts';

/** @public */
// prettier-ignore
type DiscriminatedInstrument<
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
type InstrumentDef<TKind extends InstrumentKind, TLanguage extends InstrumentLanguage, TSchema extends z.ZodTypeAny> = {
  kind: TKind;
  language: TLanguage;
  validationSchema: TSchema;
} & Omit<
  DiscriminatedInstrument<TKind, TLanguage, z.TypeOf<TSchema>>,
  '__runtimeVersion' | 'kind' | 'language' | 'validationSchema'
>;

/** @public */
export declare function defineInstrument<
  TKind extends InstrumentKind,
  TLanguage extends InstrumentLanguage,
  TSchema extends z.ZodTypeAny
>(def: InstrumentDef<TKind, TLanguage, TSchema>): DiscriminatedInstrument<TKind, TLanguage, z.TypeOf<TSchema>>;
