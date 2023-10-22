import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import { PartialType } from '@nestjs/swagger';
import { createGroupDataSchema } from '@open-data-capture/schemas/group';

import { CreateGroupDto } from './create-group.dto';

@ValidationSchema(createGroupDataSchema.partial())
export class UpdateGroupDto extends PartialType(CreateGroupDto) {
  name?: string;
}
