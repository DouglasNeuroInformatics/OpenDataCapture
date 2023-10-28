import type { Subject, SubjectIdentificationData } from '../subject/subject.types';

export type Visit = {
  date: Date;
  subject: Subject;
};

export type CreateVisitData = Omit<Visit, 'subject'> & {
  subjectIdData: SubjectIdentificationData;
};
