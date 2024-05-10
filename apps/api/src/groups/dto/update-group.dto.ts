import { ValidationSchema } from '@douglasneuroinformatics/libnest/core';
import { PartialType } from '@nestjs/swagger';
import { $UpdateGroupData, type GroupSettings } from '@opendatacapture/schemas/group';

import { CreateGroupDto } from './create-group.dto';

@ValidationSchema($UpdateGroupData)
export class UpdateGroupDto extends PartialType(CreateGroupDto) {
  accessibleInstrumentIds?: string[];
  name?: string;
  settings?: GroupSettings;
}
