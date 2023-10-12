export type AssignmentStatus = 'CANCELED' | 'COMPLETE' | 'EXPIRED' | 'OUTSTANDING';

export type Assignment = {
  status: AssignmentStatus;
  timeAssigned: number;
  timeExpires: number;
  title: string;
};

export type CreateAssignmentData = {
  instrumentIdentifier: string;
  subjectIdentifier: string;
};
