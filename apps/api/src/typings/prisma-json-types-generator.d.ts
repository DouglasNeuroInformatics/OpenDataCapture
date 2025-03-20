import type { InstrumentMeasureValue } from '@opendatacapture/runtime-core';

declare global {
  namespace PrismaJson {
    type ComputedMeasures = null | undefined | { [key: string]: InstrumentMeasureValue };
  }
}
