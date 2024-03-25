import { ValidationSchema } from '@douglasneuroinformatics/libnest/core';
import { ApiProperty } from '@nestjs/swagger';
import { $SubjectIdentificationData } from '@open-data-capture/schemas/subject';
import type { Sex, SubjectIdentificationData } from '@open-data-capture/schemas/subject';

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
