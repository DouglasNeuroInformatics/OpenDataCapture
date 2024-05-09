import { ValidationSchema } from '@douglasneuroinformatics/libnest/core';
import { $CreateSessionData, type SessionType } from '@opendatacapture/schemas/session';
import type { ClinicalSubjectIdentificationData } from '@opendatacapture/schemas/subject';

@ValidationSchema($CreateSessionData)
export class CreateSessionDto {
  date: Date;
  groupId: null | string;
  subjectIdData: ClinicalSubjectIdentificationData;
  type: SessionType;
}
