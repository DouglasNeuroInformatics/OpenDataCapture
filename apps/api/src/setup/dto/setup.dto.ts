import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import { ApiProperty } from '@nestjs/swagger';
import { setupOptionsSchema } from '@open-data-capture/schemas/setup';
import type { CreateAdminData, SetupOptions } from '@open-data-capture/types';

@ValidationSchema(setupOptionsSchema)
export class SetupDto implements SetupOptions {
  @ApiProperty()
  admin: CreateAdminData;

  @ApiProperty()
  initDemo: boolean;
}
