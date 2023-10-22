import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import { ApiProperty } from '@nestjs/swagger';
import { createUserDataSchema } from '@open-data-capture/schemas/user';
import type { BasePermissionLevel, CreateUserData } from '@open-data-capture/types';

@ValidationSchema(createUserDataSchema)
export class CreateUserDto implements CreateUserData {
  @ApiProperty({
    description: "Determines the user's base permissions, which may later be modified by an admin",
    enum: ['ADMIN', 'GROUP_MANAGER', 'STANDARD'] satisfies BasePermissionLevel[],
    type: String
  })
  basePermissionLevel?: BasePermissionLevel;

  @ApiProperty({ description: 'First Name' })
  firstName?: string;

  @ApiProperty({
    description: 'The names of the group(s) to which the user belongs',
    example: ['Memory Clinic', 'Depression Clinic']
  })
  groupNames?: string[];

  @ApiProperty({ description: 'Last Name' })
  lastName?: string;

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
