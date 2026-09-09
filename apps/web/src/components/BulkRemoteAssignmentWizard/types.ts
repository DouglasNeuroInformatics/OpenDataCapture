import type { Assignment } from '@opendatacapture/schemas/assignment';

import type { BulkParseResult } from '@/utils/bulk-assignments';

/** What the results step needs from a created assignment: who it is for, and the link to hand out. */
export type CreatedAssignment = Pick<Assignment, 'expiresAt' | 'instrumentId' | 'subjectId' | 'url'>;

/**
 * The wizard is a linear machine, and each state carries exactly what that step needs. Modelling it
 * this way rather than as a bag of optional fields is what makes it impossible to reach the review
 * step without resolved subject ids, or the timepoint step without a source.
 */
export type WizardState =
  | { assignments: CreatedAssignment[]; step: 'DONE' }
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
