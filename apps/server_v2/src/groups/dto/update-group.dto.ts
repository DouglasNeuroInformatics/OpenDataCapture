import { PartialType } from '@nestjs/swagger';

import { CreateGroupDto } from './create-group.dto.js';

export class UpdateGroupDto extends PartialType(CreateGroupDto) {}
