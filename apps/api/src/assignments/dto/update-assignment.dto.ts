import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import { ApiProperty } from '@nestjs/swagger';
import { updateAssignmentDataSchema } from '@open-data-capture/schemas/assignment';
import type { AssignmentStatus, UpdateAssignmentData } from '@open-data-capture/types';

@ValidationSchema(updateAssignmentDataSchema)
export class UpdateAssignmentDto implements UpdateAssignmentData {
  @ApiProperty()
  expiresAt: Date;

  @ApiProperty()
  status: AssignmentStatus;
}
