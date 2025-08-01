import { ValidationSchema } from '@douglasneuroinformatics/libnest';
import { $CreateSessionData } from '@opendatacapture/schemas/session';
import type { SessionType } from '@opendatacapture/schemas/session';
import type { CreateSubjectData } from '@opendatacapture/schemas/subject';
import type { CreateUserData } from '@opendatacapture/schemas/user';

@ValidationSchema($CreateSessionData)
export class CreateSessionDto {
  date: Date;
  groupId: null | string;
  subjectData: CreateSubjectData;
  type: SessionType;
  userData: CreateUserData;
}
