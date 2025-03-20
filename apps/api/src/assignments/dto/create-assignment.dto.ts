import { ValidationSchema } from '@douglasneuroinformatics/libnest';
import { ApiProperty } from '@nestjs/swagger';
import { $CreateAssignmentData } from '@opendatacapture/schemas/assignment';
import type { CreateAssignmentData } from '@opendatacapture/schemas/assignment';

@ValidationSchema($CreateAssignmentData)
export class CreateAssignmentDto implements CreateAssignmentData {
  @ApiProperty()
  expiresAt: Date;

  @ApiProperty()
  groupId?: null | string;

  @ApiProperty()
  instrumentId: string;

  @ApiProperty()
  subjectId: string;
}
