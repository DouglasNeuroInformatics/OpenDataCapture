import { z } from 'zod';

import { $FormInstrument } from './instrument.form.js';
import { $InteractiveInstrument } from './instrument.interactive.js';
import { $SeriesInstrument } from './instrument.series.js';

import type { Json, Language } from '../core/core.js';
import type { InstrumentKind } from './instrument.base.js';
import type { AnyMultilingualFormInstrument, AnyUnilingualFormInstrument, FormInstrument } from './instrument.form.js';
import type { InteractiveInstrument } from './instrument.interactive.js';
import type { SeriesInstrument } from './instrument.series.js';

type AnyScalarInstrument = FormInstrument | InteractiveInstrument;

type AnyInstrument = AnyScalarInstrument | SeriesInstrument;
type SomeInstrument<TKind extends InstrumentKind> = Extract<AnyInstrument, { kind: TKind }>;

const $AnyScalarInstrument: z.ZodType<AnyScalarInstrument> = z.union([$FormInstrument, $InteractiveInstrument]);
const $AnyInstrument: z.ZodType<AnyInstrument> = z.union([$FormInstrument, $InteractiveInstrument, $SeriesInstrument]);

type AnyUnilingualInstrument = AnyUnilingualFormInstrument | InteractiveInstrument | SeriesInstrument<Language>;
type SomeUnilingualInstrument<TKind extends InstrumentKind> = Extract<AnyUnilingualInstrument, { kind: TKind }>;

type AnyUnilingualScalarInstrument = AnyUnilingualFormInstrument | InteractiveInstrument<Json>;
type SomeUnilingualScalarInstrument<TKind extends InstrumentKind> = Extract<
  AnyUnilingualScalarInstrument,
  { kind: TKind }
>;

type AnyMultilingualInstrument = AnyMultilingualFormInstrument | SeriesInstrument<Language[]>;

export { $AnyInstrument, $AnyScalarInstrument };
export type {
  AnyInstrument,
  AnyMultilingualInstrument,
  AnyScalarInstrument,
  AnyUnilingualInstrument,
  AnyUnilingualScalarInstrument,
  SomeInstrument,
  SomeUnilingualInstrument,
  SomeUnilingualScalarInstrument
};
