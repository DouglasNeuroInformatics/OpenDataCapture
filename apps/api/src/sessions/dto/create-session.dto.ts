import { ValidationSchema } from '@douglasneuroinformatics/libnest/core';
import { $CreateSessionData, type SessionType } from '@opendatacapture/schemas/session';
import type { SubjectIdentificationData } from '@opendatacapture/schemas/subject';

@ValidationSchema($CreateSessionData)
export class CreateSessionDto {
  date: Date;
  groupId: null | string;
  subjectIdData: SubjectIdentificationData;
  type: SessionType;
}
