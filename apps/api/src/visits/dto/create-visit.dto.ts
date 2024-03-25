import { ValidationSchema } from '@douglasneuroinformatics/libnest/core';
import type { SubjectIdentificationData } from '@open-data-capture/schemas/subject';
import { $CreateVisitData } from '@open-data-capture/schemas/visit';

@ValidationSchema($CreateVisitData)
export class CreateVisitDto {
  date: Date;
  groupId: null | string;
  subjectIdData: SubjectIdentificationData;
}
