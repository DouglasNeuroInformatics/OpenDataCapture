import type { FormInstrument, FormInstrumentSummary } from './instrument';

export type AssignmentStatus = 'CANCELED' | 'COMPLETE' | 'EXPIRED' | 'OUTSTANDING';

export type Assignment = {
  assignedAt: Date;
  expiresAt: Date;
  id?: string;
  instrument: FormInstrument;
  status: AssignmentStatus;
};

export type AssignmentSummary = Omit<Assignment, 'instrument'> & {
  instrument: FormInstrumentSummary;
};

export type CreateAssignmentData = {
  expiresAt: Date;
  instrumentId: string;
  subjectIdentifier: string;
};

export type UpdateAssignmentData = Partial<Pick<Assignment, 'expiresAt' | 'status'>>;
