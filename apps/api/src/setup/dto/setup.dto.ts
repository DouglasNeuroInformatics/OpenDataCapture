import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import { ApiProperty } from '@nestjs/swagger';
import type { SetupOptions } from '@open-data-capture/types';
import { z } from 'zod';

import { CreateUserDataSchema } from '@/users/dto/create-user.dto';

const AdminSchema = CreateUserDataSchema.omit({ basePermissionLevels: true, groupNames: true });

const SetupDataSchema = z.object({
  admin: AdminSchema,
  initDemo: z.boolean()
});

export type Admin = z.infer<typeof AdminSchema>;

@ValidationSchema(SetupDataSchema)
export class SetupDto implements SetupOptions {
  @ApiProperty()
  admin: Admin;

  @ApiProperty()
  initDemo: boolean;
}
