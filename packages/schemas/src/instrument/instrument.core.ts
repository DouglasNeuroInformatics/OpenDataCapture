import type {
  AnyInstrument,
  AnyScalarInstrument,
  FormInstrument,
  InstrumentLanguage,
  InteractiveInstrument,
  SeriesInstrument
} from '@opendatacapture/runtime-core';
import { z } from 'zod/v4';

import { $$FormInstrument } from './instrument.form.js';
import { $$InteractiveInstrument } from './instrument.interactive.js';
import { $$SeriesInstrument } from './instrument.series.js';

const $$AnyScalarInstrument = <TLanguage extends InstrumentLanguage>(language?: TLanguage) => {
  return z.discriminatedUnion('kind', [
    $$FormInstrument(language),
    $$InteractiveInstrument(language)
  ]) satisfies z.ZodType<
    FormInstrument<FormInstrument.Data, TLanguage> | InteractiveInstrument<InteractiveInstrument.Data, TLanguage>
  >;
};

const $AnyScalarInstrument = $$AnyScalarInstrument() satisfies z.ZodType<AnyScalarInstrument>;

const $$AnyInstrument = <TLanguage extends InstrumentLanguage>(language?: TLanguage) => {
  return z.discriminatedUnion('kind', [
    $$FormInstrument(language),
    $$InteractiveInstrument(language),
    $$SeriesInstrument(language)
  ]) satisfies z.ZodType<
    | FormInstrument<FormInstrument.Data, TLanguage>
    | InteractiveInstrument<InteractiveInstrument.Data, TLanguage>
    | SeriesInstrument<TLanguage>
  >;
};

const $AnyInstrument = $$AnyInstrument() satisfies z.ZodType<AnyInstrument>;

export { $$AnyInstrument, $AnyInstrument, $AnyScalarInstrument };
