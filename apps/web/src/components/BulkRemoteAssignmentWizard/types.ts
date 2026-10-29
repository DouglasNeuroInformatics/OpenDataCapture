import type { Assignment } from '@opendatacapture/schemas/assignment';

/** What the results step needs from a created assignment: who it is for, and the link to hand out. */
export type CreatedAssignment = Pick<Assignment, 'expiresAt' | 'id' | 'instrumentId' | 'subjectId' | 'url'>;

/**
 * Which screen the wizard is on. The data behind each screen lives in the wizard rather than in the
 * step components, so stepping backwards - including by breadcrumb - never discards it.
 */
export type WizardStep = 'DONE' | 'MAP' | 'REVIEW' | 'SOURCE' | 'TIMEPOINTS';

/**
 * Which source the subjects step is reading from. One at a time: offering all three at once left it
 * unclear which the wizard would act on, and a file dropped while text was pasted had no defined
 * precedence. Held by the wizard like the rest of the batch, so Back from the mapping step returns
 * to the tab the file or paste came from.
 */
export type SourceMode = 'FILE' | 'PASTE' | 'SELECT';

/** A timepoint while the user is still editing it; `expiresAt` is an input value, not yet a Date. */
export type DraftTimepoint = {
  expiresAt: string;
  instrumentId: string;
  instrumentTitle: string;
};
