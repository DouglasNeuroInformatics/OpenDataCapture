import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import { ApiProperty } from '@nestjs/swagger';
import { createGroupDataSchema } from '@open-data-capture/schemas/group';
import type { CreateGroupData } from '@open-data-capture/types';

@ValidationSchema(createGroupDataSchema)
export class CreateGroupDto implements CreateGroupData {
  @ApiProperty({ example: 'Depression Clinic' })
  name: string;
}
