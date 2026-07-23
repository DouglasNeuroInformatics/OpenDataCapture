import { ValidationSchema } from '@douglasneuroinformatics/libnest';
import { $UpdateGroupData } from '@opendatacapture/schemas/group';
import type { GroupEmailTemplate, GroupSettings, GroupType, UpdateGroupData } from '@opendatacapture/schemas/group';

@ValidationSchema($UpdateGroupData)
export class UpdateGroupDto implements UpdateGroupData {
  accessibleInstrumentIds?: string[];
  activeAssignmentEmailTemplateId?: null | string;
  activeInformationTemplateId?: null | string;
  emailTemplates?: GroupEmailTemplate[];
  instrumentRepoIds?: string[];
  name?: string;
  settings?: Partial<GroupSettings>;
  type?: GroupType;
}
