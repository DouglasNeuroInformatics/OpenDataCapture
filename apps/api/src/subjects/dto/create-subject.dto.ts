import { ValidationSchema } from '@douglasneuroinformatics/libnest/core';
import { ApiProperty } from '@nestjs/swagger';
import { $ClinicalSubjectIdentificationData } from '@opendatacapture/schemas/subject';
import type { ClinicalSubjectIdentificationData, Sex } from '@opendatacapture/schemas/subject';

@ValidationSchema($ClinicalSubjectIdentificationData)
export class CreateSubjectDto implements ClinicalSubjectIdentificationData {
  @ApiProperty()
  dateOfBirth: Date;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  sex: Sex;
}
