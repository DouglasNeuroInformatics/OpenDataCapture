import { z } from 'zod';

import { $FormInstrument } from './instrument.form.js';
import { $InteractiveInstrument } from './instrument.interactive.js';

import type { Json } from '../core/core.js';
import type { InstrumentKind } from './instrument.base.js';
import type { AnyMultilingualFormInstrument, AnyUnilingualFormInstrument, FormInstrument } from './instrument.form.js';
import type { InteractiveInstrument } from './instrument.interactive.js';

export const $AnyInstrument = z.union([$FormInstrument, $InteractiveInstrument]) satisfies z.ZodType<AnyInstrument>;

export type AnyInstrument = FormInstrument | InteractiveInstrument;
export type SomeInstrument<TKind extends InstrumentKind> = Extract<AnyInstrument, { kind: TKind }>;

export type AnyUnilingualInstrument = AnyUnilingualFormInstrument | InteractiveInstrument<Json>;
export type SomeUnilingualInstrument<TKind extends InstrumentKind> = Extract<AnyUnilingualInstrument, { kind: TKind }>;

export type AnyMultilingualInstrument = AnyMultilingualFormInstrument;
export type SomeMultilingualInstrument<TKind extends InstrumentKind> = Extract<
  AnyMultilingualFormInstrument,
  { kind: TKind }
>;
