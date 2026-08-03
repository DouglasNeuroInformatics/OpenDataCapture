import type { InstrumentMeasureValue } from '@opendatacapture/runtime-core';

declare global {
  namespace PrismaJson {
    type AuditLogMetadata = { [key: string]: string };
    type ComputedMeasures = null | undefined | { [key: string]: InstrumentMeasureValue };
  }
}
