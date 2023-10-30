import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import type { SubjectIdentificationData } from '@open-data-capture/common/subject';
import { type CreateVisitData, createVisitDataSchema } from '@open-data-capture/common/visit';

@ValidationSchema(createVisitDataSchema)
export class CreateVisitDto implements CreateVisitData {
  date: Date;
  subjectIdData: SubjectIdentificationData;
}
