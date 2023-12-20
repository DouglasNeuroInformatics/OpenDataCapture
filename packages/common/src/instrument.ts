import type { FormDataType } from '@douglasneuroinformatics/form-types';
import type { IfNever } from 'type-fest';
import { z } from 'zod';

import { $FormInstrument, type FormInstrument, type FormInstrumentDef } from './instrument.form';
import {
  $InteractiveInstrument,
  type InteractiveInstrument,
  type InteractiveInstrumentDef
} from './instrument.interactive';

import type { Json, Language } from './core';
import type { InstrumentLanguage } from './instrument.base';

export type Instrument = FormInstrument | InteractiveInstrument;

export const $Instrument = z.union([$FormInstrument, $InteractiveInstrument]) satisfies Zod.ZodType<Instrument>;

type StrictInstrumentDef<TData, TLanguage extends InstrumentLanguage> =
  | FormInstrumentDef<TData, TLanguage>
  | InteractiveInstrumentDef<TData, TLanguage>;

export type InstrumentDef<TData, TLanguage extends InstrumentLanguage> = IfNever<
  StrictInstrumentDef<TData, TLanguage>,
  Instrument,
  StrictInstrumentDef<TData, TLanguage>
>;

export type UnilingualInstrument = FormInstrument<FormDataType, Language> | InteractiveInstrument<Json, Language>;

export * from './instrument.base';
export * from './instrument.form';
export * from './instrument.interactive';
export * from './instrument.utils';
