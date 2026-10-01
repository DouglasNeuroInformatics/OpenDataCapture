import { ValidationSchema } from '@douglasneuroinformatics/libnest';
import { ApiProperty } from '@nestjs/swagger';
import { $DeleteBulkAssignmentsData } from '@opendatacapture/schemas/assignment';
import type { DeleteBulkAssignmentsData } from '@opendatacapture/schemas/assignment';

@ValidationSchema($DeleteBulkAssignmentsData)
export class DeleteBulkAssignmentsDto implements DeleteBulkAssignmentsData {
  @ApiProperty()
  ids: string[];
}
