import { z } from 'zod';

import { $FormInstrument } from './instrument.form.js';
import { $InteractiveInstrument } from './instrument.interactive.js';
import { $SeriesInstrument } from './instrument.series.js';

import type { Json } from '../core/core.js';
import type { InstrumentKind } from './instrument.base.js';
import type { AnyUnilingualFormInstrument, FormInstrument } from './instrument.form.js';
import type { InteractiveInstrument } from './instrument.interactive.js';
import type { SeriesInstrument } from './instrument.series.js';

export type AnyScalarInstrument = FormInstrument | InteractiveInstrument;
export type SomeScalarInstrument<TKind extends InstrumentKind> = Extract<AnyScalarInstrument, { kind: TKind }>;

export type AnyInstrument = AnyScalarInstrument | SeriesInstrument;
export type SomeInstrument<TKind extends InstrumentKind> = Extract<AnyInstrument, { kind: TKind }>;

export const $AnyScalarInstrument: z.ZodType<AnyScalarInstrument> = z.union([$FormInstrument, $InteractiveInstrument]);
export const $AnyInstrument: z.ZodType<AnyInstrument> = z.union([
  $FormInstrument,
  $InteractiveInstrument,
  $SeriesInstrument
]);

export type AnyUnilingualScalarInstrument = AnyUnilingualFormInstrument | InteractiveInstrument<Json>;
export type SomeUnilingualScalarInstrument<TKind extends InstrumentKind> = Extract<
  AnyUnilingualScalarInstrument,
  { kind: TKind }
>;
