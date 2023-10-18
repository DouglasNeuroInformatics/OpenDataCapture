import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import { ApiProperty } from '@nestjs/swagger';
import { type Group } from '@open-data-capture/types';
import { z } from 'zod';

export const CreateGroupDataSchema = z.object({
  name: z.string().min(1)
});

@ValidationSchema(CreateGroupDataSchema)
export class CreateGroupDto implements Omit<Group, 'id'> {
  @ApiProperty({ example: 'Depression Clinic' })
  name: string;
}
