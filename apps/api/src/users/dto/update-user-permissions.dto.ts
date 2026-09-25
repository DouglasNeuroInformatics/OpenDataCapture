import { ValidationSchema } from '@douglasneuroinformatics/libnest';
import { ApiProperty } from '@nestjs/swagger';
import type { Permissions } from '@opendatacapture/schemas/core';
import { $UpdateUserPermissionsData } from '@opendatacapture/schemas/user';
import type { UpdateUserPermissionsData } from '@opendatacapture/schemas/user';

@ValidationSchema($UpdateUserPermissionsData)
export class UpdateUserPermissionsDto implements UpdateUserPermissionsData {
  @ApiProperty({ description: 'The complete set of additional permissions; replaces what is stored' })
  permissions: Permissions;
}
