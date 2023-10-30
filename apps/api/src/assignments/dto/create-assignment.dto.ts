import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import { ApiProperty } from '@nestjs/swagger';
import { type CreateAssignmentData, createAssignmentDataSchema } from '@open-data-capture/common/assignment';

@ValidationSchema(createAssignmentDataSchema)
export class CreateAssignmentDto implements CreateAssignmentData {
  @ApiProperty()
  expiresAt: Date;

  @ApiProperty()
  instrumentId: string;

  @ApiProperty()
  subjectIdentifier: string;
}
