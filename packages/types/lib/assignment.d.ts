import type { FormInstrument } from './instrument';

export type AssignmentStatus = 'CANCELED' | 'COMPLETE' | 'EXPIRED' | 'OUTSTANDING';

export type Assignment = {
  instrument: FormInstrument;
  status: AssignmentStatus;
  timeAssigned: number;
  timeExpires: number;
};

export type CreateAssignmentData = {
  instrumentId: string;
  subjectId: string;
};

export type UpdateAssignmentData = Pick<Assignment, 'status' | 'timeExpires'>;
