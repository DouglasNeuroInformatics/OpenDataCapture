import { ValidationSchema } from '@douglasneuroinformatics/libnest/core';
import { ApiProperty } from '@nestjs/swagger';
import { $CreateAssignmentData, type CreateAssignmentData } from '@opendatacapture/schemas/assignment';

@ValidationSchema($CreateAssignmentData)
export class CreateAssignmentDto implements CreateAssignmentData {
  @ApiProperty()
  expiresAt: Date;

  @ApiProperty()
  groupId?: null | string;

  @ApiProperty()
  instrumentId: string;

  @ApiProperty()
  subjectId: string;
}
