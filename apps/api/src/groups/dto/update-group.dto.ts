import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import { PartialType } from '@nestjs/swagger';

import { CreateGroupDataSchema, CreateGroupDto } from './create-group.dto';

@ValidationSchema(CreateGroupDataSchema.partial())
export class UpdateGroupDto extends PartialType(CreateGroupDto) {
  name?: string;
}
