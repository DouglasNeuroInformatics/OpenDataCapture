export type AssignmentStatus = 'COMPLETE' | 'OUTSTANDING' | 'EXPIRED' | 'CANCELED';

export type Assignment = {
  title: string;
  timeAssigned: number;
  timeExpires: number;
  status: AssignmentStatus;
};
