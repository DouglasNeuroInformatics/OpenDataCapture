import type { Group } from '../group/group.types';
import type { Subject, SubjectIdentificationData } from '../subject/subject.types';

export type Visit = {
  date: Date;
  group?: Group;
  id: string;
  subject: Subject;
};

export type CreateVisitData = {
  date: Date;
  groupId?: string;
  subjectIdData: SubjectIdentificationData;
};
