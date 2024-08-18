import type { AnyInstrument, AnyScalarInstrument } from '@opendatacapture/runtime-core';
import { z } from 'zod';

import { $FormInstrument } from './instrument.form.js';
import { $InteractiveInstrument } from './instrument.interactive.js';
import { $SeriesInstrument } from './instrument.series.js';

const $AnyScalarInstrument: z.ZodType<AnyScalarInstrument> = z.union([$FormInstrument, $InteractiveInstrument]);
const $AnyInstrument: z.ZodType<AnyInstrument> = z.union([$FormInstrument, $InteractiveInstrument, $SeriesInstrument]);

export { $AnyInstrument, $AnyScalarInstrument };
