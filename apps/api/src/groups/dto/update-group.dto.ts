import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import { PartialType } from '@nestjs/swagger';
import { type Group } from '@open-data-capture/types';

import { CreateGroupDataSchema, CreateGroupDto } from './create-group.dto';

@ValidationSchema(CreateGroupDataSchema.partial())
export class UpdateGroupDto extends PartialType(CreateGroupDto) implements Partial<Group> {
  name?: string;
}
