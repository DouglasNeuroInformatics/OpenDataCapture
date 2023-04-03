export type Sex = 'male' | 'female';

export interface Subject {
  identifier: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth: Date;
  sex: Sex;
}
