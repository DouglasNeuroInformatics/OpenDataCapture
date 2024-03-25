import { ValidationSchema } from '@douglasneuroinformatics/libnest/core';
import { ApiProperty } from '@nestjs/swagger';
import { $CreateUserData } from '@open-data-capture/schemas/user';
import type { BasePermissionLevel } from '@open-data-capture/schemas/user';

@ValidationSchema($CreateUserData)
export class CreateUserDto {
  @ApiProperty({
    description: "Determines the user's base permissions, which may later be modified by an admin",
    enum: ['ADMIN', 'GROUP_MANAGER', 'STANDARD'] satisfies BasePermissionLevel[],
    type: String
  })
  basePermissionLevel: BasePermissionLevel | null;

  @ApiProperty({ description: 'First Name' })
  firstName: string;

  @ApiProperty({
    description: 'The IDs of the group(s) to which the user belongs'
  })
  groupIds: string[];

  @ApiProperty({ description: 'Last Name' })
  lastName: string;

  @ApiProperty({
    description: 'A minimum of 8 characters, including one number, one upper case, and one lower case letter',
    example: 'TheMinimumLengthIs8ButThereIsNotAMaximumLength'
  })
  password: string;

  @ApiProperty({
    description: 'A unique descriptive name associated with this user',
    example: 'JaneDoeMemoryClinic'
  })
  username: string;
}
