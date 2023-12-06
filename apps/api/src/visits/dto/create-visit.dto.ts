import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import type { SubjectIdentificationData } from '@open-data-capture/common/subject';
import { type CreateVisitData, createVisitDataSchema } from '@open-data-capture/common/visit';

@ValidationSchema<CreateVisitData>(createVisitDataSchema)
export class CreateVisitDto {
  date: Date;
  groupId?: string;
  subjectIdData: SubjectIdentificationData;
}
