export type Sex = 'male' | 'female';

export type SubjectIdentificationData = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  sex: Sex;
};

export type Subject = {
  identifier: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth: Date;
  sex: Sex;
};
