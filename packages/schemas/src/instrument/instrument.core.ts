import type { FormDataType } from '@douglasneuroinformatics/form-types';
import { z } from 'zod';

import { $FormInstrument } from './instrument.form.js';
import { $InteractiveInstrument } from './instrument.interactive.js';

import type { Json, Language } from '../core/core.index.js';
import type { InstrumentKind, InstrumentLanguage } from './instrument.base.js';
import type {
  AnyMultilingualFormInstrument,
  AnyUnilingualFormInstrument,
  FormInstrument,
  StrictFormInstrument
} from './instrument.form.js';
import type { InteractiveInstrument } from './instrument.interactive.js';

export const $AnyInstrument = z.union([$FormInstrument, $InteractiveInstrument]) satisfies z.ZodType<AnyInstrument>;

export type AnyInstrument = FormInstrument | InteractiveInstrument;
export type SomeInstrument<TKind extends InstrumentKind> = Extract<AnyInstrument, { kind: TKind }>;

export type AnyUnilingualInstrument = AnyUnilingualFormInstrument | InteractiveInstrument<Json, Language>;
export type SomeUnilingualInstrument<TKind extends InstrumentKind> = Extract<AnyUnilingualInstrument, { kind: TKind }>;

export type AnyMultilingualInstrument = AnyMultilingualFormInstrument;
export type SomeMultilingualInstrument<TKind extends InstrumentKind> = Extract<
  AnyMultilingualFormInstrument,
  { kind: TKind }
>;

// FOR AUTOCOMPLETE

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
        ? InteractiveInstrument<TData, TLanguage>
        : never
      : never
    : never;

export type InstrumentDef<
  TKind extends InstrumentKind,
  TData extends DiscriminatedInstrumentData<TKind>,
  TLanguage extends InstrumentLanguage
> = Omit<DiscriminatedInstrument<TKind, TData, TLanguage, { strict: true }>, 'kind' | 'language' | 'validationSchema'>;
