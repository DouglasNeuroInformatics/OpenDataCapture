import { ValidationSchema } from '@douglasneuroinformatics/libnest/core';
import { ApiProperty } from '@nestjs/swagger';
import { $CreateSubjectData } from '@opendatacapture/schemas/subject';
import type { Sex } from '@opendatacapture/schemas/subject';

@ValidationSchema($CreateSubjectData)
export class CreateSubjectDto {
  @ApiProperty()
  dateOfBirth?: Date | null;

  @ApiProperty()
  firstName?: null | string;

  @ApiProperty()
  id: string;

  @ApiProperty()
  lastName?: null | string;

  @ApiProperty()
  sex?: Sex | null;
}
