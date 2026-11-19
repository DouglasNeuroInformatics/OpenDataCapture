import type { Language } from './core.js';
import type { InstrumentKind } from './instrument.base.js';
import type { AnyMultilingualFileInstrument, AnyUnilingualFileInstrument, FileInstrument } from './instrument.file.js';
import type { AnyMultilingualFormInstrument, AnyUnilingualFormInstrument, FormInstrument } from './instrument.form.js';
import type {
  AnyMultilingualInteractiveInstrument,
  AnyUnilingualInteractiveInstrument,
  InteractiveInstrument
} from './instrument.interactive.js';
import type { SeriesInstrument } from './instrument.series.js';

/** @internal */
type AnyScalarInstrument = FileInstrument | FormInstrument | InteractiveInstrument;

/** @internal */
type AnyInstrument = AnyScalarInstrument | SeriesInstrument;

/** @internal */
type SomeInstrument<TKind extends InstrumentKind> = Extract<AnyInstrument, { kind: TKind }>;

/** @internal */
type AnyUnilingualInstrument =
  | AnyUnilingualFileInstrument
  | AnyUnilingualFormInstrument
  | AnyUnilingualInteractiveInstrument
  | SeriesInstrument<Language>;

/** @internal */
type SomeUnilingualInstrument<TKind extends InstrumentKind> = Extract<AnyUnilingualInstrument, { kind: TKind }>;

/** @internal */
type AnyUnilingualScalarInstrument =
  | AnyUnilingualFileInstrument
  | AnyUnilingualFormInstrument
  | AnyUnilingualInteractiveInstrument;

/** @internal */
type SomeUnilingualScalarInstrument<TKind extends InstrumentKind> = Extract<
  AnyUnilingualScalarInstrument,
  { kind: TKind }
>;

/** @internal */
type AnyMultilingualInstrument =
  | AnyMultilingualFileInstrument
  | AnyMultilingualFormInstrument
  | AnyMultilingualInteractiveInstrument
  | SeriesInstrument<Language[]>;

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
