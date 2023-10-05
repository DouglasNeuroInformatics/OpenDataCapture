import { ApiProperty } from '@nestjs/swagger';
import { type Group } from '@open-data-capture/types';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGroupDto implements Group {
  @ApiProperty({ example: 'Depression Clinic' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
