import { ValidationSchema } from '@douglasneuroinformatics/libnest/core';
import { ApiProperty } from '@nestjs/swagger';
import { $SubjectIdentificationData } from '@opendatacapture/schemas/subject';
import type { Sex, SubjectIdentificationData } from '@opendatacapture/schemas/subject';

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
