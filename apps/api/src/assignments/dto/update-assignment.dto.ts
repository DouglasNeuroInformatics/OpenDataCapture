import { ValidationSchema } from '@douglasneuroinformatics/libnest/core';
import { ApiProperty } from '@nestjs/swagger';
import { $UpdateAssignmentData } from '@opendatacapture/schemas/assignment';
import type { AssignmentStatus, UpdateAssignmentData } from '@opendatacapture/schemas/assignment';

@ValidationSchema($UpdateAssignmentData)
export class UpdateAssignmentDto implements UpdateAssignmentData {
  @ApiProperty()
  expiresAt?: Date;

  @ApiProperty()
  status?: AssignmentStatus;
}
