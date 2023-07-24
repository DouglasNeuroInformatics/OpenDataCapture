import { ApiProperty } from '@nestjs/swagger';

import { Group } from '@ddcp/types';
import { IsString } from 'class-validator';

export class CreateGroupDto implements Group {
  @ApiProperty({ example: 'Depression Clinic' })
  @IsString()
  name: string;
}
