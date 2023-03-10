import { ApiProperty } from '@nestjs/swagger';

import { UserInterface } from '../users.types';

import { ValidationSchema } from '@/core/validation-schema.decorator';

export type CreateUserData = Omit<UserInterface, 'refreshToken' | 'groups'> & {
  groupNames?: string[];
};

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
    groupNames: {
      type: 'array',
      items: {
        type: 'string',
        minLength: 1
      },
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
    description: 'Whether the user should have admin permission (i.e., full access to all resources)',
    example: true
  })
  isAdmin?: boolean;

  @ApiProperty({
    description: 'The names of the group(s) to which the user belongs',
    example: ['Memory Clinic', 'Depression Clinic']
  })
  groupNames?: string[];

  /*

  @ApiProperty({
    description: "Determines the user's base permissions. Further information is provided in the standard docs.",
    enum: ['system-admin', 'group-manager', 'standard-user'] satisfies UserRole[],
    example: 'system-admin' satisfies UserRole,
    externalDocs: {
      description: 'Additional Information',
      url: 'https://douglasneuroinformatics.github.io/DouglasDataCapturePlatform/#/features/authentication'
    }
  })
  role: UserRole; */
}
