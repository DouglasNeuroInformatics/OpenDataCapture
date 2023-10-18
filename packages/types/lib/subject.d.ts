export type Sex = 'female' | 'male';

export type Subject = {
  dateOfBirth: Date;
  firstName?: string;
  identifier: string;
  lastName?: string;
  sex: Sex;
};

export type SubjectIdentificationData = Omit<Subject, 'identifier'>;
