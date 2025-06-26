import type { AnyInstrument, AnyScalarInstrument } from '@opendatacapture/runtime-core';
import { z } from 'zod/v4';

import { $FormInstrument } from './instrument.form.js';
import { $InteractiveInstrument } from './instrument.interactive.js';
import { $SeriesInstrument } from './instrument.series.js';

const $AnyScalarInstrument = z.discriminatedUnion('kind', [
  $FormInstrument,
  $InteractiveInstrument
]) satisfies z.ZodType<AnyScalarInstrument>;

const $AnyInstrument: z.ZodType<AnyInstrument> = z.discriminatedUnion('kind', [
  $FormInstrument,
  $InteractiveInstrument,
  $SeriesInstrument
]);

export { $AnyInstrument, $AnyScalarInstrument };
