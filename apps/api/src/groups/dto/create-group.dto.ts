import { ValidationSchema } from '@douglasneuroinformatics/libnest/core';
import { ApiProperty } from '@nestjs/swagger';
import { $CreateGroupData } from '@open-data-capture/common/group';
import type { CreateGroupData } from '@open-data-capture/common/group';

@ValidationSchema($CreateGroupData)
export class CreateGroupDto implements CreateGroupData {
  @ApiProperty({ example: 'Depression Clinic' })
  name: string;
}
