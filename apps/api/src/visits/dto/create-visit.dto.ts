import { ValidationSchema } from '@douglasneuroinformatics/libnest/core';
import type { SubjectIdentificationData } from '@opendatacapture/schemas/subject';
import { $CreateVisitData } from '@opendatacapture/schemas/visit';

@ValidationSchema($CreateVisitData)
export class CreateVisitDto {
  date: Date;
  groupId: null | string;
  subjectIdData: SubjectIdentificationData;
}
