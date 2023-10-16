import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import { ApiProperty } from '@nestjs/swagger';
import type { BasePermissionLevel, User } from '@open-data-capture/types';
import { type ZodType, z } from 'zod';

type CreateUserData = {
  groupNames?: string[];
} & Omit<User, 'groups' | 'preferences'>;

const basePermissionLevels = ['ADMIN', 'GROUP_MANAGER', 'STANDARD'] as const;

// Matches string with 8 or more characters, minimum one upper case, lowercase, and number
const isStrongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

export const createUserDtoSchema: ZodType<CreateUserData> = z.object({
  basePermissionLevels: z.enum(basePermissionLevels).optional(),
  firstName: z.string().optional(),
  groupNames: z.array(z.string()).min(1).optional(),
  lastName: z.string().optional(),
  password: z.string().regex(isStrongPassword),
  username: z.string().min(1)
});

@ValidationSchema(createUserDtoSchema)
export class CreateUserDto implements CreateUserData {
  @ApiProperty({
    description: "Determines the user's base permissions, which may later be modified by an admin",
    enum: basePermissionLevels,
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
