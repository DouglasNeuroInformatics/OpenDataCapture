import { UserInterface } from '../interfaces/user.interface';

import { BaseUserDto } from './base-user.dto';

import { ValidationSchema } from '@/core/validation-schema.decorator';

type CreateUserData = Omit<UserInterface, 'refreshToken'>;

// Matches string with 8 or more characters, minimum one upper case, lowercase, and number
const isStrongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

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
export class CreateUserDto extends BaseUserDto implements CreateUserData {}
