import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import { ApiProperty } from '@nestjs/swagger';
import type { CreateGroupData } from '@open-data-capture/common/group';
import { setupOptionsSchema } from '@open-data-capture/common/setup';
import type { CreateAdminData, SetupOptions } from '@open-data-capture/common/setup';

@ValidationSchema<SetupOptions>(setupOptionsSchema)
export class SetupDto {
  @ApiProperty()
  admin: CreateAdminData;

  @ApiProperty()
  adminGroup: CreateGroupData;

  @ApiProperty()
  initDemo: boolean;
}
