import type { FormDataType } from '@douglasneuroinformatics/form-types';
import { z } from 'zod';

import { $FormInstrument, $FormInstrumentDef, type FormInstrument } from './instrument.form';
import {
  $InteractiveInstrument,
  $InteractiveInstrumentDef,
  type InteractiveInstrument
} from './instrument.interactive';

import type { Json, Language } from './core';

export type Instrument = FormInstrument | InteractiveInstrument;

export const $Instrument = z.union([$FormInstrument, $InteractiveInstrument]) satisfies z.ZodType<Instrument>;

export const $InstrumentDef = z.union([$FormInstrumentDef, $InteractiveInstrumentDef]);
export type UnilingualInstrument = FormInstrument<FormDataType, Language> | InteractiveInstrument<Json, Language>;

export * from './instrument.base';
export * from './instrument.form';
export * from './instrument.interactive';
export * from './instrument.utils';
