import { reviver } from '@douglasneuroinformatics/libjs';
import type { AnyUnilingualScalarInstrument, Json } from '@opendatacapture/runtime-core';

export type SubmissionValidationResult = { issues: unknown; success: false } | { success: true };

/**
 * Validate serialized submission data against a scalar instrument's validation schema, mirroring the
 * check the API performs before ingesting a record (see `InstrumentRecordsService`). The data is
 * round-tripped through the `reviver` so serialized types (e.g. `Set`, `Date`) are reconstructed
 * into the shape the schema expects — exactly as the API does prior to validating. The gateway
 * cannot evaluate the bundle to run this check itself (it is internet-facing, unlike the API), so
 * this is the last opportunity to reject nonconforming data before it is encrypted and submitted.
 */
export function validateSubmission(
  instrument: AnyUnilingualScalarInstrument,
  serializedData: Json
): SubmissionValidationResult {
  const result = instrument.validationSchema.safeParse(JSON.parse(JSON.stringify(serializedData), reviver));
  if (result.success) {
    return { success: true };
  }
  return { issues: result.error.issues, success: false };
}
