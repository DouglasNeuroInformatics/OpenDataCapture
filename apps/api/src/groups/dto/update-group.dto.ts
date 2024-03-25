import { ValidationSchema } from '@douglasneuroinformatics/libnest/core';
import { PartialType } from '@nestjs/swagger';
import { $UpdateGroupData } from '@open-data-capture/schemas/group';

import { CreateGroupDto } from './create-group.dto';

@ValidationSchema($UpdateGroupData)
export class UpdateGroupDto extends PartialType(CreateGroupDto) {
  name?: string;
}
