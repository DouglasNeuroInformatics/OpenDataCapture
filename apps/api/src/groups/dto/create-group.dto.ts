import { ValidationSchema } from '@douglasneuroinformatics/libnest/core';
import { ApiProperty } from '@nestjs/swagger';
import { $CreateGroupData } from '@opendatacapture/schemas/group';
import type { CreateGroupData, GroupType } from '@opendatacapture/schemas/group';

@ValidationSchema($CreateGroupData)
export class CreateGroupDto implements CreateGroupData {
  @ApiProperty({ example: 'Depression Clinic' })
  name: string;
  type: GroupType;
}
