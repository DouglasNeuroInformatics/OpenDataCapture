import type { z } from 'zod';

import type { Json, Language } from './types/core.d.ts';
import type { InstrumentKind, InstrumentLanguage } from './types/instrument.base.d.ts';
import type { FormInstrument } from './types/instrument.form.d.ts';
import type { InteractiveInstrument } from './types/instrument.interactive.d.ts';

/** @public */
type DiscriminatedInstrumentData<TKind extends InstrumentKind> = [TKind] extends ['FORM']
  ? FormInstrument.Data
  : [TKind] extends ['INTERACTIVE']
    ? Json
    : [TKind] extends ['SERIES']
      ? undefined
      : never;

/** @public */
type DiscriminatedInstrument<
  TKind extends InstrumentKind,
  TLanguage extends InstrumentLanguage,
  TData extends DiscriminatedInstrumentData<TKind>
> = [TKind] extends ['FORM']
  ? TData extends FormInstrument.Data
    ? FormInstrument<TData, TLanguage>
    : never
  : [TKind] extends ['INTERACTIVE']
    ? TData extends Json
      ? TLanguage extends Language
        ? InteractiveInstrument<TData, TLanguage>
        : never
      : never
    : never;

/** @public */
type InstrumentDiscriminatedProps<
  TKind extends InstrumentKind,
  TLanguage extends InstrumentLanguage,
  TData extends DiscriminatedInstrumentData<TKind>
> = Omit<DiscriminatedInstrument<TKind, TLanguage, TData>, 'kind' | 'language' | 'validationSchema'>;

/** @public */
type InstrumentDef<
  TKind extends InstrumentKind,
  TLanguage extends InstrumentLanguage,
  TSchema extends z.ZodType<DiscriminatedInstrumentData<TKind>>
> = { kind: TKind; language: TLanguage; validationSchema: TSchema } & InstrumentDiscriminatedProps<
  TKind,
  TLanguage,
  z.TypeOf<TSchema>
>;

/** @public */
export declare function defineInstrument<
  TKind extends InstrumentKind,
  TLanguage extends InstrumentLanguage,
  TSchema extends z.ZodType<DiscriminatedInstrumentData<TKind>>
>(def: Omit<InstrumentDef<TKind, TLanguage, TSchema>, '__runtimeVersion'>): InstrumentDef<TKind, TLanguage, TSchema>;
