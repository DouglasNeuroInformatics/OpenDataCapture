import { ApiProperty } from '@nestjs/swagger';
import type { BasePermissionLevel, User } from '@open-data-capture/types';
import { ArrayMinSize, IsIn, IsOptional, IsString, Matches } from 'class-validator';

type CreateUserData = {
  groupNames?: string[];
} & Omit<User, 'groups' | 'preferences'>;

// Matches string with 8 or more characters, minimum one upper case, lowercase, and number
const isStrongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

const basePermissionLevels = ['ADMIN', 'GROUP_MANAGER', 'STANDARD'] satisfies BasePermissionLevel[];

export class CreateUserDto implements CreateUserData {
  @ApiProperty({
    description: "Determines the user's base permissions, which may later be modified by an admin",
    enum: basePermissionLevels,
    type: String
  })
  @IsOptional()
  @IsIn(basePermissionLevels)
  basePermissionLevel?: BasePermissionLevel;

  @ApiProperty({ description: 'First Name' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    description: 'The names of the group(s) to which the user belongs',
    example: ['Memory Clinic', 'Depression Clinic']
  })
  @IsOptional()
  @IsString({ each: true })
  @ArrayMinSize(1)
  groupNames?: string[];

  @ApiProperty({ description: 'Last Name' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    description: 'A minimum of 8 characters, including one number, one upper case, and one lower case letter',
    example: 'TheMinimumLengthIs8ButThereIsNotAMaximumLength'
  })
  @Matches(isStrongPassword)
  password: string;

  @ApiProperty({
    description: 'A unique descriptive name associated with this user',
    example: 'JaneDoeMemoryClinic'
  })
  @IsString()
  username: string;
}
