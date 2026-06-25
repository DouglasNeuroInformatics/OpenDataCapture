import { ValidationSchema } from '@douglasneuroinformatics/libnest';
import { ApiProperty } from '@nestjs/swagger';
import type { Sex } from '@opendatacapture/schemas/subject';
import { $CreateUserData } from '@opendatacapture/schemas/user';
import type { BasePermissionLevel, CreateUserData } from '@opendatacapture/schemas/user';

const regex = new RegExp(/^\+?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,9}$/);

// Note: password strength, username-match, and breached-password checks are enforced
// centrally in `UsersService.validatePassword` so they apply to every flow that sets a
// password (user creation, admin edits, self-service updates, and initial setup).
@ValidationSchema(
  $CreateUserData.check((ctx) => {
    if (ctx.value.phoneNumber && !regex.test(ctx.value.phoneNumber)) {
      ctx.issues.push({
        code: 'custom',
        input: ctx.value.phoneNumber,
        message: `Invalid phone number`,
        path: ['phoneNumber']
      });
    }
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

  @ApiProperty({ description: 'Disabled' })
  disabled?: boolean;

  @ApiProperty({ description: 'Email' })
  email?: string;

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

  @ApiProperty({ description: 'Phone Number' })
  phoneNumber?: string;

  @ApiProperty({ description: 'Sex at Birth' })
  @ApiProperty()
  sex?: Sex;

  @ApiProperty({
    description: 'A unique descriptive name associated with this user',
    example: 'JaneDoeMemoryClinic'
  })
  username: string;
}
