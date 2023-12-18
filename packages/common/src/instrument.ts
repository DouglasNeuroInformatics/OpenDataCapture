import type { FormDataType } from '@douglasneuroinformatics/form-types';
import type { FormInstrument } from './instrument.form';
import type { InteractiveInstrument } from './instrument.interactive';
import type { Language } from './core';
import type { Jsonifiable } from 'type-fest';

export type Instrument = FormInstrument | InteractiveInstrument;

export type UnilingualInstrument =
  | FormInstrument<FormDataType, Language>
  | InteractiveInstrument<Jsonifiable, Language>;

export * from './instrument.base';
export * from './instrument.form';
export * from './instrument.interactive';
