import { z } from 'zod';

import { $FormInstrument } from './instrument.form.js';
import { $InteractiveInstrument } from './instrument.interactive.js';

import type { Json } from '../core/core.js';
import type { InstrumentKind } from './instrument.base.js';
import type { AnyUnilingualFormInstrument, FormInstrument } from './instrument.form.js';
import type { InteractiveInstrument } from './instrument.interactive.js';

export const $AnyScalarInstrument: z.ZodType<AnyScalarInstrument> = z.union([$FormInstrument, $InteractiveInstrument]);

export type AnyScalarInstrument = FormInstrument | InteractiveInstrument;
export type SomeScalarInstrument<TKind extends InstrumentKind> = Extract<AnyScalarInstrument, { kind: TKind }>;

export type AnyUnilingualScalarInstrument = AnyUnilingualFormInstrument | InteractiveInstrument<Json>;
export type SomeUnilingualScalarInstrument<TKind extends InstrumentKind> = Extract<
  AnyUnilingualScalarInstrument,
  { kind: TKind }
>;
