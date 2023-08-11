import { PartialType } from '@nestjs/swagger';

import { IsOptional } from 'class-validator';

import { CreateGroupDto } from '../dto/create-group.dto.js';

export class UpdateGroupDto extends PartialType(CreateGroupDto) {
  @IsOptional()
  name?: string;
}
