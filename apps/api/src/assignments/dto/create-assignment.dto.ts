import { ValidationSchema } from '@douglasneuroinformatics/libnest/core';
import { ApiProperty } from '@nestjs/swagger';
import { $CreateAssignmentData, type CreateAssignmentData } from '@open-data-capture/schemas/assignment';

@ValidationSchema($CreateAssignmentData)
export class CreateAssignmentDto implements CreateAssignmentData {
  @ApiProperty()
  expiresAt: Date;

  @ApiProperty()
  instrumentId: string;

  @ApiProperty()
  subjectId: string;
}
