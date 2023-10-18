import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import { ApiProperty } from '@nestjs/swagger';
import { type Group } from '@open-data-capture/types';
import { ZodType, z } from 'zod';

export type CreateGroupData = Omit<Group, 'id'>;

export const CreateGroupDataSchema = z.object({
  name: z.string().min(1)
}) satisfies ZodType<CreateGroupData>;

@ValidationSchema(CreateGroupDataSchema)
export class CreateGroupDto implements CreateGroupData {
  @ApiProperty({ example: 'Depression Clinic' })
  name: string;
}
