import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import { ApiProperty } from '@nestjs/swagger';
import type { AssignmentStatus, UpdateAssignmentData } from '@open-data-capture/types';
import { ZodType, z } from 'zod';

const AssignmentStatusSchema: ZodType<AssignmentStatus> = z.enum(['CANCELED', 'COMPLETE', 'EXPIRED', 'OUTSTANDING']);

const UpdateAssignmentDataSchema: ZodType<UpdateAssignmentData> = z.object({
  status: AssignmentStatusSchema,
  timeExpires: z.number().int().positive()
});

@ValidationSchema(UpdateAssignmentDataSchema)
export class UpdateAssignmentDto implements UpdateAssignmentData {
  @ApiProperty()
  status: AssignmentStatus;

  @ApiProperty()
  timeExpires: number;
}
