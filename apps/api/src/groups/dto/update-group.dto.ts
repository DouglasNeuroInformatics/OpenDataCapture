import { PartialType } from '@nestjs/swagger';

import { IsOptional } from 'class-validator';

import { CreateGroupDto } from './create-group.dto';

export class UpdateGroupDto extends PartialType(CreateGroupDto) {
  @IsOptional()
  name?: string;
}
