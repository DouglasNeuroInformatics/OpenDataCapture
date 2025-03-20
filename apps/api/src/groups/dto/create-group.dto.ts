import { ValidationSchema } from '@douglasneuroinformatics/libnest';
import { ApiProperty } from '@nestjs/swagger';
import { $CreateGroupData } from '@opendatacapture/schemas/group';
import type { CreateGroupData, GroupSettings, GroupType } from '@opendatacapture/schemas/group';

@ValidationSchema($CreateGroupData)
export class CreateGroupDto implements CreateGroupData {
  @ApiProperty({ example: 'Depression Clinic' })
  name: string;
  settings?: GroupSettings;
  type: GroupType;
}
