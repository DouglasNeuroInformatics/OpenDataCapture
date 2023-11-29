import { ApiProperty } from '@nestjs/swagger';
import type { Group } from '@open-data-capture/common/group';

export class GroupEntity implements Group {
  static readonly modelName = 'Group';

  @ApiProperty({ example: 'Depression Clinic' })
  name: string;
}
