import { ValidationSchema } from '@douglasneuroinformatics/libnest/core';
import { ApiProperty } from '@nestjs/swagger';
import { $UpdateAssignmentData } from '@open-data-capture/common/assignment';
import type { AssignmentStatus, UpdateAssignmentData } from '@open-data-capture/common/assignment';

@ValidationSchema($UpdateAssignmentData)
export class UpdateAssignmentDto implements UpdateAssignmentData {
  @ApiProperty()
  expiresAt?: Date;

  @ApiProperty()
  status?: AssignmentStatus;
}
