import { ValidationSchema } from '@douglasneuroinformatics/libnest/core';
import { ApiProperty } from '@nestjs/swagger';
import { $UpdateAssignmentData } from '@open-data-capture/schemas/assignment';
import type { AssignmentStatus, UpdateAssignmentData } from '@open-data-capture/schemas/assignment';

@ValidationSchema($UpdateAssignmentData)
export class UpdateAssignmentDto implements UpdateAssignmentData {
  @ApiProperty()
  expiresAt?: Date;

  @ApiProperty()
  status?: AssignmentStatus;
}
