import { Subject, type SubjectIdentificationData } from '@open-data-capture/types';

export type Visit = {
  date: Date;
  subject: Subject;
};

export type CreateVisitData = Omit<Visit, 'subject'> & {
  subjectIdData: SubjectIdentificationData;
};
