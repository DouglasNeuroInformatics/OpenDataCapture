import type { Json, Language } from './core.d.ts';
import type { InstrumentKind } from './instrument.base.d.ts';
import type {
  AnyMultilingualFormInstrument,
  AnyUnilingualFormInstrument,
  FormInstrument
} from './instrument.form.d.ts';
import type { InteractiveInstrument } from './instrument.interactive.d.ts';
import type { SeriesInstrument } from './instrument.series.d.ts';

/** @public */
type AnyScalarInstrument = FormInstrument | InteractiveInstrument;

/** @public */
type AnyInstrument = AnyScalarInstrument | SeriesInstrument;

/** @public */
type SomeInstrument<TKind extends InstrumentKind> = Extract<AnyInstrument, { kind: TKind }>;

/** @public */
type AnyUnilingualInstrument = AnyUnilingualFormInstrument | InteractiveInstrument | SeriesInstrument<Language>;

/** @public */
type SomeUnilingualInstrument<TKind extends InstrumentKind> = Extract<AnyUnilingualInstrument, { kind: TKind }>;

/** @public */
type AnyUnilingualScalarInstrument = AnyUnilingualFormInstrument | InteractiveInstrument<Json>;

/** @public */
type SomeUnilingualScalarInstrument<TKind extends InstrumentKind> = Extract<
  AnyUnilingualScalarInstrument,
  { kind: TKind }
>;

/** @public */
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
