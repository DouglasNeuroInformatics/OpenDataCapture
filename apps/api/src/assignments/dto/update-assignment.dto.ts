import { ValidationSchema } from '@douglasneuroinformatics/libnest';
import { ApiProperty } from '@nestjs/swagger';
import { $UpdateAssignmentData } from '@opendatacapture/schemas/assignment';
import type { AssignmentStatus, UpdateAssignmentData } from '@opendatacapture/schemas/assignment';
import { z } from 'zod/v4';

@ValidationSchema(
  $UpdateAssignmentData.extend({
    status: z.literal('CANCELED')
  })
)
export class UpdateAssignmentDto implements UpdateAssignmentData {
  @ApiProperty()
  status: Extract<AssignmentStatus, 'CANCELED'>;
}
