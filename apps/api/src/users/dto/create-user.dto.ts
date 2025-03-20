import { ValidationSchema } from '@douglasneuroinformatics/libnest';
import { estimatePasswordStrength } from '@douglasneuroinformatics/libpasswd';
import { ApiProperty } from '@nestjs/swagger';
import type { Sex } from '@opendatacapture/schemas/subject';
import { $CreateUserData } from '@opendatacapture/schemas/user';
import type { BasePermissionLevel, CreateUserData } from '@opendatacapture/schemas/user';
import { z } from 'zod';

@ValidationSchema(
  $CreateUserData.extend({
    password: $CreateUserData.shape.password.superRefine((val, ctx) => {
      const result = estimatePasswordStrength(val, {
        feedbackLanguage: 'en'
      });
      if (!result.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Insufficient password strength: ${result.score}`
        });
      }
    })
  })
)
export class CreateUserDto implements CreateUserData {
  @ApiProperty({
    description: "Determines the user's base permissions, which may later be modified by an admin",
    enum: ['ADMIN', 'GROUP_MANAGER', 'STANDARD'] satisfies BasePermissionLevel[],
    type: String
  })
  basePermissionLevel: BasePermissionLevel | null;

  @ApiProperty({ description: 'Date of Birth' })
  dateOfBirth?: Date;

  @ApiProperty({ description: 'First Name' })
  firstName: string;

  @ApiProperty({
    description: 'The IDs of the group(s) to which the user belongs'
  })
  groupIds: string[];

  @ApiProperty({ description: 'Last Name' })
  lastName: string;

  @ApiProperty({
    description: 'A password with an accessed strength of three or more, see https://github.com/zxcvbn-ts/zxcvbn'
  })
  password: string;

  @ApiProperty({ description: 'Sex at Birth' })
  @ApiProperty()
  sex?: Sex;

  @ApiProperty({
    description: 'A unique descriptive name associated with this user',
    example: 'JaneDoeMemoryClinic'
  })
  username: string;
}
