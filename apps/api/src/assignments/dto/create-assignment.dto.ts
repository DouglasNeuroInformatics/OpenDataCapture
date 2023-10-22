import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import { ApiProperty } from '@nestjs/swagger';
import { createAssignmentDataSchema } from '@open-data-capture/schemas/assignment';
import { type CreateAssignmentData } from '@open-data-capture/types';

@ValidationSchema(createAssignmentDataSchema)
export class CreateAssignmentDto implements CreateAssignmentData {
  @ApiProperty()
  instrumentId: string;

  @ApiProperty()
  subjectId: string;
}
