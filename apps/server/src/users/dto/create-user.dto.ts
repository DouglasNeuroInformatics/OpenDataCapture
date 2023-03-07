import { ApiProperty } from '@nestjs/swagger';

import { UserInterface, UserRole } from '../users.types';

import { ValidationSchema } from '@/core/validation-schema.decorator';

export type CreateUserData = Omit<UserInterface, 'refreshToken'>;

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
    role: {
      type: 'string',
      enum: ['system-admin', 'group-manager', 'standard-user']
    }
  },
  required: ['username', 'password', 'role']
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
    description: "Determines the user's base permissions. Further information is provided in the standard docs.",
    enum: ['system-admin', 'group-manager', 'standard-user'] satisfies UserRole[],
    example: 'system-admin' satisfies UserRole,
    externalDocs: {
      description: 'Additional Information',
      url: 'https://douglasneuroinformatics.github.io/DouglasDataCapturePlatform/#/features/authentication'
    }
  })
  role: UserRole;
}
