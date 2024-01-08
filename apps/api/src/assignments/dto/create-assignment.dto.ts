import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import { ApiProperty } from '@nestjs/swagger';
import { $CreateAssignmentData, type CreateAssignmentData } from '@open-data-capture/common/assignment';

@ValidationSchema($CreateAssignmentData)
export class CreateAssignmentDto implements CreateAssignmentData {
  @ApiProperty()
  expiresAt: Date;

  @ApiProperty()
  instrumentId: string;

  @ApiProperty()
  subjectIdentifier: string;
}
