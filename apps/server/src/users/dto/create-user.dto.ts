import { ApiProperty } from '@nestjs/swagger';

import { Dto } from '@/core/decorators/dto.decorator';
import { DefaultPermissionLevel } from '@/permissions/permissions.types';

interface CreateUserData {
  username: string;
  password: string;
  defaultPermissionLevel?: DefaultPermissionLevel;
  groupNames?: string[];
}

// Matches string with 8 or more characters, minimum one upper case, lowercase, and number
export const isStrongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

@Dto<CreateUserData>({
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
    defaultPermissionLevel: {
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
    description: "Determines the user's base permissions, which may later be modified by an admin",
    enum: ['admin', 'group-manager', 'standard']
  })
  defaultPermissionLevel?: DefaultPermissionLevel;

  @ApiProperty({
    description: 'The names of the group(s) to which the user belongs',
    example: ['Memory Clinic', 'Depression Clinic'],
    externalDocs: {
      description: 'Additional Information',
      url: 'https://douglasneuroinformatics.github.io/DouglasDataCapturePlatform/#/features/authentication'
    }
  })
  groupNames?: string[];
}
