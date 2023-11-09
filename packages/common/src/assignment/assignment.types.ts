import type { BaseInstrument, FormInstrumentSummary } from '../instrument/instrument.types';

export type AssignmentStatus = 'CANCELED' | 'COMPLETE' | 'EXPIRED' | 'OUTSTANDING';

export type Assignment<TInstrument extends BaseInstrument = BaseInstrument> = {
  assignedAt: Date;
  expiresAt: Date;
  id?: number;
  instrument: TInstrument;
  status: AssignmentStatus;
  url: string;
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
