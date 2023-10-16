import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import { ApiProperty } from '@nestjs/swagger';
import type { SetupOptions } from '@open-data-capture/types';
import { z } from 'zod';

import { createUserDtoSchema } from '@/users/dto/create-user.dto';

const adminSchema = createUserDtoSchema.omit({ basePermissionLevels: true, groupNames: true });

const setupDtoSchema = z.object({
  admin: adminSchema,
  initDemo: z.boolean()
});

export type Admin = z.infer<typeof adminSchema>;

@ValidationSchema(setupDtoSchema)
export class SetupDto implements SetupOptions {
  @ApiProperty()
  admin: Admin;

  @ApiProperty()
  initDemo: boolean;
}
