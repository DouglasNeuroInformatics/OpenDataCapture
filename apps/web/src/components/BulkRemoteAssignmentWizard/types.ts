import type { Assignment } from '@opendatacapture/schemas/assignment';

/** What the results step needs from a created assignment: who it is for, and the link to hand out. */
export type CreatedAssignment = Pick<Assignment, 'expiresAt' | 'instrumentId' | 'subjectId' | 'url'>;

/**
 * Which screen the wizard is on. The data behind each screen lives in the wizard rather than in the
 * step components, so stepping backwards — including by breadcrumb — never discards it.
 */
export type WizardStep = 'DONE' | 'MAP' | 'REVIEW' | 'SOURCE' | 'TIMEPOINTS';

/** A timepoint while the user is still editing it; `expiresAt` is an input value, not yet a Date. */
export type DraftTimepoint = {
  expiresAt: string;
  instrumentId: string;
  instrumentTitle: string;
};
