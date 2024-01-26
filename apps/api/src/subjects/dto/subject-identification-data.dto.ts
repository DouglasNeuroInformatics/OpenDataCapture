import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import { ApiProperty } from '@nestjs/swagger';
import { $SubjectIdentificationData } from '@open-data-capture/common/subject';
import type { Sex, SubjectIdentificationData } from '@open-data-capture/common/subject';

@ValidationSchema($SubjectIdentificationData)
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
