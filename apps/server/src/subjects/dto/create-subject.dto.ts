import { Sex, SubjectIdentificationData, subjectIdentificationDataSchema } from '@ddcp/common';

import { ValidationSchema } from '@/core/decorators/validation-schema.decorator';

@ValidationSchema<SubjectIdentificationData>(subjectIdentificationDataSchema)
export class CreateSubjectDto {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  sex: Sex;
}
