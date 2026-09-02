import type { BulkParseResult } from '@/utils/bulk-assignments';

/**
 * The wizard is a linear machine, and each state carries exactly what that step needs. Modelling it
 * this way rather than as a bag of optional fields is what makes it impossible to reach the review
 * step without resolved subject ids, or the timepoint step without a source.
 */
export type WizardState =
  | { createdCount: number; step: 'DONE'; subjectIds: string[] }
  | { parsed: BulkParseResult; step: 'MAP' }
  | { step: 'REVIEW'; subjectIds: string[]; timepoints: DraftTimepoint[] }
  | { step: 'SOURCE' }
  | { step: 'TIMEPOINTS'; subjectIds: string[] };

/** A timepoint while the user is still editing it; `expiresAt` is an input value, not yet a Date. */
export type DraftTimepoint = {
  expiresAt: string;
  instrumentId: string;
  instrumentTitle: string;
};
