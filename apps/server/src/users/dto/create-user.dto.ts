import { ApiProperty } from '@nestjs/swagger';

import { User } from '@ddcp/common';
import { BasePermissionLevel } from '@ddcp/common/auth';

import { ValidationSchema } from '@/core/decorators/validation-schema.decorator';

interface CreateUserData extends Omit<User, 'preferences' | 'groups'> {
  groupNames?: string[];
}

// Matches string with 8 or more characters, minimum one upper case, lowercase, and number
export const isStrongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

@ValidationSchema<CreateUserData>({
  type: 'object',
  properties: {
    username: {
      type: 'string',
      minLength: 1
    },
    password: {
      type: 'string',
      pattern: isStrongPassword.source
    },
    basePermissionLevel: {
      type: 'string',
      enum: ['admin', 'group-manager', 'standard'],
      nullable: true
    },
    groupNames: {
      type: 'array',
      items: {
        type: 'string',
        minLength: 1
      },
      nullable: true
    },
    firstName: {
      type: 'string',
      minLength: 1,
      nullable: true
    },
    lastName: {
      type: 'string',
      minLength: 1,
      nullable: true
    }
  },
  required: ['username', 'password']
})
export class CreateUserDto implements CreateUserData {
  @ApiProperty({ description: 'A unique descriptive name associated with this user', example: 'JaneDoeMemoryClinic' })
  username: string;

  @ApiProperty({
    description: 'A minimum of 8 characters, including one number, one upper case, and one lower case letter',
    example: 'TheMinimumLengthIs8ButThereIsNotAMaximumLength'
  })
  password: string;

  @ApiProperty({
    description: "Determines the user's base permissions, which may later be modified by an admin",
    enum: ['admin', 'group-manager', 'standard']
  })
  basePermissionLevel?: BasePermissionLevel;

  @ApiProperty({
    description: 'The names of the group(s) to which the user belongs',
    example: ['Memory Clinic', 'Depression Clinic'],
    externalDocs: {
      description: 'Additional Information',
      url: 'https://douglasneuroinformatics.github.io/DouglasDataCapturePlatform/#/features/authentication'
    }
  })
  groupNames?: string[];

  @ApiProperty()
  firstName?: string;

  @ApiProperty()
  lastName?: string;
}
