import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import { ApiProperty } from '@nestjs/swagger';
import { $InitAppOptions } from '@open-data-capture/common/setup';
import type { CreateAdminData, InitAppOptions } from '@open-data-capture/common/setup';

@ValidationSchema($InitAppOptions)
export class SetupDto implements InitAppOptions {
  @ApiProperty()
  admin: CreateAdminData;

  @ApiProperty()
  enableGateway: boolean;

  @ApiProperty()
  initDemo: boolean;
}
