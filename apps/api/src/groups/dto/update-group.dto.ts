import { ValidationSchema } from '@douglasneuroinformatics/libnest/core';
import { $UpdateGroupData } from '@opendatacapture/schemas/group';
import type { GroupSettings, GroupType, UpdateGroupData } from '@opendatacapture/schemas/group';

@ValidationSchema($UpdateGroupData)
export class UpdateGroupDto implements UpdateGroupData {
  accessibleInstrumentIds?: string[];
  name?: string;
  settings?: Partial<GroupSettings>;
  type?: GroupType;
}
