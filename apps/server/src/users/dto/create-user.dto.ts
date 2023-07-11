import { ApiProperty } from '@nestjs/swagger';

import type { BasePermissionLevel, User } from '@ddcp/types';
import { ArrayMinSize, IsBoolean, IsIn, IsOptional, IsString, Matches } from 'class-validator';

interface CreateUserData extends Omit<User, 'preferences' | 'groups'> {
  groupNames?: string[];
}

// Matches string with 8 or more characters, minimum one upper case, lowercase, and number
const isStrongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

const basePermissionLevels = ['ADMIN', 'GROUP_MANAGER', 'STANDARD'] satisfies BasePermissionLevel[];

export class CreateUserDto implements CreateUserData {
  @ApiProperty({
    description: 'A unique descriptive name associated with this user',
    example: 'JaneDoeMemoryClinic'
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'A minimum of 8 characters, including one number, one upper case, and one lower case letter',
    example: 'TheMinimumLengthIs8ButThereIsNotAMaximumLength'
  })
  @Matches(isStrongPassword)
  password: string;

  @ApiProperty({
    description:
      'Whether the user is an admin, in which case the frontend will render content for all groups the user has permission to access'
  })
  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;

  @ApiProperty({
    description: "Determines the user's base permissions, which may later be modified by an admin",
    enum: basePermissionLevels,
    type: String
  })
  @IsOptional()
  @IsIn(basePermissionLevels)
  basePermissionLevel?: BasePermissionLevel;

  @ApiProperty({
    description: 'The names of the group(s) to which the user belongs',
    example: ['Memory Clinic', 'Depression Clinic'],
    externalDocs: {
      description: 'Additional Information',
      url: 'https://douglasneuroinformatics.github.io/DouglasDataCapturePlatform/#/features/authentication'
    }
  })
  @IsOptional()
  @IsString({ each: true })
  @ArrayMinSize(1)
  groupNames?: string[];

  @ApiProperty({ description: 'First Name' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ description: 'Last Name' })
  @IsOptional()
  @IsString()
  lastName?: string;
}
