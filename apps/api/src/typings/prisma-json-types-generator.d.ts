import type { InstrumentMeasureValue } from '@opendatacapture/runtime-core';

declare global {
  namespace PrismaJson {
    type ComputedMeasures = { [key: string]: InstrumentMeasureValue } | null | undefined;
  }
}

export {};
