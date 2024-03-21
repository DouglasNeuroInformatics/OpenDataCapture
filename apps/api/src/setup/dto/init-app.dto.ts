import { ValidationSchema } from '@douglasneuroinformatics/libnest/core';
import { ApiProperty } from '@nestjs/swagger';
import { $InitAppOptions } from '@open-data-capture/common/setup';
import type { CreateAdminData, InitAppOptions } from '@open-data-capture/common/setup';

@ValidationSchema($InitAppOptions)
export class InitAppDto implements InitAppOptions {
  @ApiProperty()
  admin: CreateAdminData;

  @ApiProperty()
  dummySubjectCount?: number;

  @ApiProperty()
  initDemo: boolean;
}
