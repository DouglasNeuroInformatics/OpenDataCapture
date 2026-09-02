import { ValidationSchema } from '@douglasneuroinformatics/libnest';
import { ApiProperty } from '@nestjs/swagger';
import { $BulkAssignmentPreflightData, $CreateBulkAssignmentsData } from '@opendatacapture/schemas/assignment';
import type {
  BulkAssignmentPreflightData,
  BulkAssignmentTimepoint,
  CreateBulkAssignmentsData
} from '@opendatacapture/schemas/assignment';

@ValidationSchema($BulkAssignmentPreflightData)
export class BulkAssignmentPreflightDto implements BulkAssignmentPreflightData {
  @ApiProperty()
  allowDuplicates: boolean;

  @ApiProperty()
  groupId: string;

  @ApiProperty()
  subjectIds: string[];

  @ApiProperty()
  timepoints: BulkAssignmentTimepoint[];
}

@ValidationSchema($CreateBulkAssignmentsData)
export class CreateBulkAssignmentsDto implements CreateBulkAssignmentsData {
  @ApiProperty()
  allowDuplicates: boolean;

  @ApiProperty()
  groupId: string;

  @ApiProperty()
  subjectIds: string[];

  @ApiProperty()
  timepoints: BulkAssignmentTimepoint[];
}
