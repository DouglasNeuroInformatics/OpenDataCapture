import { ApiProperty } from '@nestjs/swagger';

import { GroupInterface } from '../groups.types';

import { ValidationSchema } from '@/core/decorators/validation-schema.decorator';

@ValidationSchema<GroupInterface>({
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1
    }
  },
  additionalProperties: false,
  required: ['name']
})
export class CreateGroupDto implements GroupInterface {
  @ApiProperty({ example: 'Depression Clinic' })
  name: string;
}
