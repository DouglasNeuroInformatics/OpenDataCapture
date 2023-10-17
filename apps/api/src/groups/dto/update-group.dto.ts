import { PartialType } from '@nestjs/swagger';
import { type Group } from '@open-data-capture/types';

import { CreateGroupDto } from './create-group.dto';

export class UpdateGroupDto extends PartialType(CreateGroupDto) implements Partial<Group> {
  name?: string;
}
