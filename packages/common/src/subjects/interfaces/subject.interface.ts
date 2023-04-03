export type Sex = 'male' | 'female';

export type Subject = {
  identifier: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth: Date;
  sex: Sex;
}
