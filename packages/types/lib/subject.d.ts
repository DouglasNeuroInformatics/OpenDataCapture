export type Sex = 'female' | 'male';

export type Subject = {
  dateOfBirth: Date;
  firstName?: string;
  id: string;
  lastName?: string;
  sex: Sex;
};

export type SubjectIdentificationData = Omit<Subject, 'id'>;
