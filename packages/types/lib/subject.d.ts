export type Sex = 'female' | 'male';

export type SubjectIdentificationData = {
  dateOfBirth: string;
  firstName: string;
  lastName: string;
  sex: Sex;
};

export type Subject = {
  dateOfBirth: Date;
  firstName?: string;
  identifier: string;
  lastName?: string;
  sex: Sex;
};
