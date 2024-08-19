import type { Json, Language } from './core.d.ts';
import type { InstrumentKind } from './instrument.base.d.ts';
import type {
  AnyMultilingualFormInstrument,
  AnyUnilingualFormInstrument,
  FormInstrument
} from './instrument.form.d.ts';
import type { InteractiveInstrument } from './instrument.interactive.d.ts';
import type { SeriesInstrument } from './instrument.series.d.ts';

/** @internal */
type AnyScalarInstrument = FormInstrument | InteractiveInstrument;

/** @internal */
type AnyInstrument = AnyScalarInstrument | SeriesInstrument;

/** @internal */
type SomeInstrument<TKind extends InstrumentKind> = Extract<AnyInstrument, { kind: TKind }>;

/** @internal */
type AnyUnilingualInstrument = AnyUnilingualFormInstrument | InteractiveInstrument | SeriesInstrument<Language>;

/** @internal */
type SomeUnilingualInstrument<TKind extends InstrumentKind> = Extract<AnyUnilingualInstrument, { kind: TKind }>;

/** @internal */
type AnyUnilingualScalarInstrument = AnyUnilingualFormInstrument | InteractiveInstrument<Json>;

/** @internal */
type SomeUnilingualScalarInstrument<TKind extends InstrumentKind> = Extract<
  AnyUnilingualScalarInstrument,
  { kind: TKind }
>;

/** @internal */
type AnyMultilingualInstrument = AnyMultilingualFormInstrument | SeriesInstrument<Language[]>;

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
