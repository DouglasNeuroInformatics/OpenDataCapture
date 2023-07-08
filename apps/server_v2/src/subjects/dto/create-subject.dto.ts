import { Sex, SubjectIdentificationData, subjectIdentificationDataSchema } from '@douglasneuroinformatics/common';

import { ValidationSchema } from '@/core/decorators/validation-schema.decorator.js';

@ValidationSchema<SubjectIdentificationData>(subjectIdentificationDataSchema)
export class CreateSubjectDto {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  sex: Sex;
}
