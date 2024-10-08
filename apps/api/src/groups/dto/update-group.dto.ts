import { ValidationSchema } from '@douglasneuroinformatics/libnest/core';
import { PartialType } from '@nestjs/swagger';
import { $UpdateGroupData, type GroupSettings, type GroupType } from '@opendatacapture/schemas/group';

import { CreateGroupDto } from './create-group.dto';

@ValidationSchema($UpdateGroupData)
export class UpdateGroupDto extends PartialType(CreateGroupDto) {
  accessibleInstrumentIds?: string[];
  override name?: string;
  settings?: GroupSettings;
  override type?: GroupType;
}
