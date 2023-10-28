import type { FormInstrumentType, InstrumentSummary } from '../instrument/instrument.types';

export type AssignmentStatus = 'CANCELED' | 'COMPLETE' | 'EXPIRED' | 'OUTSTANDING';

export type Assignment = {
  assignedAt: Date;
  expiresAt: Date;
  id?: string;
  instrument: FormInstrumentType;
  status: AssignmentStatus;
};

export type AssignmentSummary = Omit<Assignment, 'instrument'> & {
  instrument: InstrumentSummary;
};

export type CreateAssignmentData = {
  expiresAt: Date;
  instrumentId: string;
  subjectIdentifier: string;
};

export type UpdateAssignmentData = Partial<Pick<Assignment, 'expiresAt' | 'status'>>;
