import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import { PartialType } from '@nestjs/swagger';
import { type Group } from '@open-data-capture/types';

import { CreateGroupDto, CreateGroupDtoSchema } from './create-group.dto';

const UpdateGroupDtoSchema = CreateGroupDtoSchema.partial();

@ValidationSchema(UpdateGroupDtoSchema)
export class UpdateGroupDto extends PartialType(CreateGroupDto) implements Partial<Group> {
  name?: string;
}
