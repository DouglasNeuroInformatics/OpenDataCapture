import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import type { SubjectIdentificationData } from '@open-data-capture/common/subject';
import { $CreateVisitData } from '@open-data-capture/common/visit';

@ValidationSchema($CreateVisitData)
export class CreateVisitDto {
  date: Date;
  groupId: null | string;
  subjectIdData: SubjectIdentificationData;
}
