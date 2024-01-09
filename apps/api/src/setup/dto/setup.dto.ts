import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import { ApiProperty } from '@nestjs/swagger';
import { $SetupOptions } from '@open-data-capture/common/setup';
import type { CreateAdminData, SetupOptions } from '@open-data-capture/common/setup';

@ValidationSchema($SetupOptions)
export class SetupDto implements SetupOptions {
  @ApiProperty()
  admin: CreateAdminData;

  @ApiProperty()
  initDemo: boolean;
}
