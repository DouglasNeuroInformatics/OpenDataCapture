import type { FormDataType } from '@douglasneuroinformatics/form-types';
import { z } from 'zod';

import {
  $FormInstrument,
  type FormInstrument,
  type FormInstrumentSummary,
  type StrictFormInstrument,
  type UnilingualFormInstrumentSummary
} from './instrument.form';
import {
  $InteractiveInstrument,
  type InteractiveInstrument,
  type InteractiveInstrumentSummary
} from './instrument.interactive';

import type { Json, Language } from './core';
import type { InstrumentKind, InstrumentLanguage } from './instrument.base';

export type Instrument = FormInstrument | InteractiveInstrument;

export const $Instrument = z.union([$FormInstrument, $InteractiveInstrument]) satisfies z.ZodType<Instrument>;

export type InstrumentSummary = FormInstrumentSummary | InteractiveInstrumentSummary;

export type UnilingualInstrument = FormInstrument<FormDataType, Language> | InteractiveInstrument<Json, Language>;

export type UnilingualInstrumentSummary = InteractiveInstrumentSummary | UnilingualFormInstrumentSummary;

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
> = Omit<DiscriminatedInstrument<TKind, TData, TLanguage, { strict: true }>, 'kind' | 'language'>;

export * from './instrument.base';
export * from './instrument.form';
export * from './instrument.interactive';
export * from './instrument.utils';
