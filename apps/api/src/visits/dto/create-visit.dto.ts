import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import { createVisitDataSchema } from '@open-data-capture/schemas/visit';
import type { CreateVisitData, SubjectIdentificationData } from '@open-data-capture/types';

@ValidationSchema(createVisitDataSchema)
export class CreateVisitDto implements CreateVisitData {
  date: Date;
  subjectIdData: SubjectIdentificationData;
}
