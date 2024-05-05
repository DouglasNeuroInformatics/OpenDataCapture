import { z } from 'zod';

import { $FormInstrument } from './instrument.form.js';
import { $InteractiveInstrument } from './instrument.interactive.js';
import { $SeriesInstrument, type SeriesInstrument } from './instrument.series.js';

import type { Json } from '../core/core.js';
import type { InstrumentKind } from './instrument.base.js';
import type { AnyMultilingualFormInstrument, AnyUnilingualFormInstrument, FormInstrument } from './instrument.form.js';
import type { InteractiveInstrument } from './instrument.interactive.js';

export const $AnyInstrument: z.ZodType<AnyInstrument> = z.union([
  $FormInstrument,
  $InteractiveInstrument,
  $SeriesInstrument
]);

export type AnyInstrument = FormInstrument | InteractiveInstrument | SeriesInstrument;
export type SomeInstrument<TKind extends InstrumentKind> = Extract<AnyInstrument, { kind: TKind }>;

export type AnyUnilingualInstrument = AnyUnilingualFormInstrument | InteractiveInstrument<Json> | SeriesInstrument;
export type SomeUnilingualInstrument<TKind extends InstrumentKind> = Extract<AnyUnilingualInstrument, { kind: TKind }>;

export type AnyMultilingualInstrument = AnyMultilingualFormInstrument;
export type SomeMultilingualInstrument<TKind extends InstrumentKind> = Extract<
  AnyMultilingualFormInstrument,
  { kind: TKind }
>;
