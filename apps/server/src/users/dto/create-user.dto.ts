import { ApiProperty } from '@nestjs/swagger';

import { BasePermissionLevel, type User } from '@ddcp/common/users';

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
    isAdmin: {
      type: 'boolean',
      nullable: true
    },
    basePermissionLevel: {
      type: 'string',
      enum: Object.values(BasePermissionLevel),
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
export class CreateUserDto {
  @ApiProperty({ description: 'A unique descriptive name associated with this user', example: 'JaneDoeMemoryClinic' })
  username: string;

  @ApiProperty({
    description: 'A minimum of 8 characters, including one number, one upper case, and one lower case letter',
    example: 'TheMinimumLengthIs8ButThereIsNotAMaximumLength'
  })
  password: string;

  @ApiProperty({
    description:
      'Whether the user is an admin, in which case the frontend will render content for all groups the user has permission to access'
  })
  isAdmin?: boolean;
  
  @ApiProperty({
    description: "Determines the user's base permissions, which may later be modified by an admin",
    enum: BasePermissionLevel,
    type: String
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

  @ApiProperty({ description: 'First Name ' })
  firstName?: string;

  @ApiProperty({ description: 'Last Name' })
  lastName?: string;
}
