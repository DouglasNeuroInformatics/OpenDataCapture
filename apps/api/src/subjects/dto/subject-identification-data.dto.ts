import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import { ApiProperty } from '@nestjs/swagger';
import { subjectIdentificationDataSchema } from '@open-data-capture/schemas/subject';
import type { Sex, SubjectIdentificationData } from '@open-data-capture/types';

@ValidationSchema(subjectIdentificationDataSchema)
export class SubjectIdentificationDataDto implements SubjectIdentificationData {
  @ApiProperty()
  dateOfBirth: Date;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  sex: Sex;
}
